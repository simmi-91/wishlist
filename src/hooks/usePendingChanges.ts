import { create } from "zustand";

type PendingChanges = {
  hasPendingChanges: boolean;
  setHasPendingChanges: (newState: boolean) => void;
};

export const usePendingChanges = create<PendingChanges>((set) => ({
  hasPendingChanges: false,
  setHasPendingChanges: (newState: boolean) =>
    set({ hasPendingChanges: newState }),
}));
