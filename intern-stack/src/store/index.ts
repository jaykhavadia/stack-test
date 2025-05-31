import { create } from 'zustand';
import { User } from '../types';

interface Store {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

const LOCAL_STORAGE_KEY = 'currentUser';

export const useStore = create<Store>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  currentUser: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || 'null'),
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    set({ currentUser: user });
  },
  logout: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({ currentUser: null });
  },
}));
