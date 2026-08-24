import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL as string;

type User = { user_id: string; email: string; name: string; picture?: string | null };

type Ctx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginMock: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<Ctx>({} as Ctx);
const KEY = "viaace.token";

async function readToken() {
  if (Platform.OS === "web") return typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  return await SecureStore.getItemAsync(KEY);
}
async function writeToken(v: string | null) {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    }
    return;
  }
  if (v) await SecureStore.setItemAsync(KEY, v);
  else await SecureStore.deleteItemAsync(KEY);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const processed = useRef<Set<string>>(new Set());
  const capturedUrl = useRef<string | null>(null);

  const exchange = useCallback(async (sessionId: string) => {
    if (processed.current.has(sessionId)) return;
    processed.current.add(sessionId);
    try {
      const r = await fetch(`${BACKEND}/api/auth/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!r.ok) throw new Error("exchange failed");
      const data = await r.json();
      await writeToken(data.session_token);
      setToken(data.session_token);
      setUser(data.user);
    } catch (e) {
      console.warn("Auth exchange failed", e);
    }
  }, []);

  useEffect(() => {
    let sub: any;
    (async () => {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const hash = window.location.hash;
        const qs = window.location.search;
        const m = (hash + qs).match(/[?#&]session_id=([^&#]+)/);
        if (m) {
          await exchange(decodeURIComponent(m[1]));
          try {
            const url = new URL(window.location.href);
            url.hash = "";
            url.searchParams.delete("session_id");
            window.history.replaceState(window.history.state, "", url.toString());
          } catch {}
        }
      } else {
        sub = Linking.addEventListener("url", ({ url }) => {
          capturedUrl.current = url;
          const m = url.match(/[?#&]session_id=([^&#]+)/);
          if (m) exchange(decodeURIComponent(m[1]));
        });
        const initial = await Linking.getInitialURL();
        if (initial) {
          const m = initial.match(/[?#&]session_id=([^&#]+)/);
          if (m) await exchange(decodeURIComponent(m[1]));
        }
      }

      const stored = await readToken();
      if (stored) {
        try {
          const r = await fetch(`${BACKEND}/api/auth/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (r.ok) {
            const u = await r.json();
            setUser(u);
            setToken(stored);
          } else {
            await writeToken(null);
          }
        } catch {
          await writeToken(null);
        }
      }
      setLoading(false);
    })();
    return () => {
      if (sub) sub.remove();
    };
  }, [exchange]);

  const loginWithGoogle = useCallback(async () => {
    const redirect = Platform.OS === "web"
      ? (typeof window !== "undefined" ? window.location.origin + "/" : "")
      : Linking.createURL("");
    const authUrl = `https://auth.my.viaace.xpress/?redirect=${encodeURIComponent(redirect)}`;
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.location.href = authUrl;
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
    let url: string | null = null;
    if (result.type === "success" && (result as any).url) url = (result as any).url;
    if (!url) url = capturedUrl.current;
    if (!url) url = await Linking.getInitialURL();
    if (url) {
      const m = url.match(/[?#&]session_id=([^&#]+)/);
      if (m) await exchange(decodeURIComponent(m[1]));
    }
  }, [exchange]);

  const loginMock = useCallback(async (name?: string) => {
    const r = await fetch(`${BACKEND}/api/auth/mock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Tetamu" }),
    });
    const data = await r.json();
    await writeToken(data.session_token);
    setToken(data.session_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${BACKEND}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    await writeToken(null);
    setToken(null);
    setUser(null);
  }, [token]);

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init?.headers as any),
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(`${BACKEND}${path}`, { ...init, headers });
    },
    [token],
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, loginMock, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
