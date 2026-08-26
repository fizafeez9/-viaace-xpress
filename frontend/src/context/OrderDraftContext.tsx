import React, { createContext, useContext, useState } from "react";

export type Size = "small" | "medium" | "large";
export type Weight = "<5" | "5-10" | "10-20" | "20+";
export type Vehicle = "motor" | "kereta";
export type LocationInput = { label: string; address: string; lat?: number; lng?: number };

type Draft = {
  pickup: LocationInput;
  stops: LocationInput[];
  size: Size;
  weight: Weight;
  vehicle: Vehicle;
  notes: string;
};

const DEFAULT: Draft = {
  pickup: { label: "Pickup", address: "" },
  stops: [{ label: "Destinasi", address: "" }],
  size: "medium",
  weight: "<5",
  vehicle: "motor",
  notes: "",
};

type Ctx = { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; reset: () => void };
const OrderCtx = createContext<Ctx>({} as Ctx);

export const OrderDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<Draft>(DEFAULT);
  const reset = () => setDraft(DEFAULT);
  return <OrderCtx.Provider value={{ draft, setDraft, reset }}>{children}</OrderCtx.Provider>;
};

export const useOrderDraft = () => useContext(OrderCtx);
