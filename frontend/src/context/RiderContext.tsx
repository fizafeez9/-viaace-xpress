import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL as string;
const KEY = "viaace.rider.token";

type Rider = { rider_id: string; name: string; plate: string; phone: string; rating: number; photo: string };

type Ctx = {
  rider: Rider | null;
  token: string | null;
  loading: boolean;
  loginRider: (code: string) => Promise<void>;
  logoutRider: () => Promise<void>;
  riderFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const RiderContext = createContext<Ctx>({} as Ctx);

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

export const RiderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rider, setRider] = useState<Rider | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await readToken();
      if (stored) {
        try {
          const r = await fetch(`${BACKEND}/api/rider/me`, {
            headers: { "X-Rider-Token": stored },
          });
          if (r.ok) {
            setRider(await r.json());
            setToken(stored);
          } else await writeToken(null);
        } catch { await writeToken(null); }
      }
      setLoading(false);
    })();
  }, []);

  const loginRider = useCallback(async (code: string) => {
    const r = await fetch(`${BACKEND}/api/rider/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rider_code: code }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.detail || "Login gagal");
    }
    const data = await r.json();
    await writeToken(data.rider_token);
    setToken(data.rider_token);
    setRider(data.rider);
  }, []);

  const logoutRider = useCallback(async () => {
    await writeToken(null);
    setToken(null);
    setRider(null);
  }, []);

  const riderFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(init?.headers as any),
      };
      if (token) headers["X-Rider-Token"] = token;
      return fetch(`${BACKEND}${path}`, { ...init, headers });
    },
    [token],
  );

  return (
    <RiderContext.Provider value={{ rider, token, loading, loginRider, logoutRider, riderFetch }}>
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => useContext(RiderContext);
