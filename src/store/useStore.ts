import { create } from "zustand";
import { devtools } from "zustand/middleware";
interface User {
  id: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
  role: "customer" | "provider" | "admin";
  avatar?: string;
  status?: string;
  bio?: string;
  profileImage?: string;
}

interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  walletId: string;
  createdAt: string;
  description: string;
  status: string;
  paymentMethod?: string;
}

interface DashboardState {
  user: User | null;
  wallet: Wallet | null;
  transactions: Transaction[] | [];
  setUser: (user: User) => void;
  setWallet: (wallet: Wallet) => void;
  setTransactions: (tx: Transaction[]) => void;
  clearDashboard: () => void;
}

export const useStore = create<DashboardState>()(
  devtools(
    (set) => ({
      user: null,
      wallet: null,
      transactions: [],
      setUser: (user) => set({ user }),
      setWallet: (wallet) => set({ wallet }),
      setTransactions: (transactions) => set({ transactions }),
      clearDashboard: () =>
        set({
          user: null,
          wallet: null,
          transactions: [],
        }),
    }),
    { name: "DashboardStore" }
  )
);
