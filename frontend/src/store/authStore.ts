import { create } from 'zustand';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  preferences: {
    dietaryRestrictions: string[];
    allergies: string[];
    defaultHouseholdSize: number;
  };
  savedAddresses: Array<{
    id: string;
    label: string;
    addressLine: string;
    city: string;
    zipCode: string;
  }>;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  addAddress: (address: Omit<UserProfile['savedAddresses'][0], 'id'>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    uid: "usr_mock_12345",
    email: "developer@smartcart.ai",
    displayName: "Jane Doe",
    preferences: {
      dietaryRestrictions: ["vegetarian"],
      allergies: [],
      defaultHouseholdSize: 2
    },
    savedAddresses: [
      {
        id: "addr_1",
        label: "Home",
        addressLine: "Flat 405, Green Valley Apartments, Sector 56",
        city: "Gurugram",
        zipCode: "122011"
      }
    ]
  },
  loading: false,
  login: async (email: string) => {
    set({ loading: true });
    // Simulate login latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({
      user: {
        uid: "usr_mock_12345",
        email,
        displayName: email.split('@')[0],
        preferences: {
          dietaryRestrictions: [],
          allergies: [],
          defaultHouseholdSize: 1
        },
        savedAddresses: []
      },
      loading: false
    });
  },
  logout: () => set({ user: null }),
  updatePreferences: (prefs) => set((state) => {
    if (!state.user) return state;
    return {
      user: {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          ...prefs
        }
      }
    };
  }),
  addAddress: (addr) => set((state) => {
    if (!state.user) return state;
    const newAddress = {
      ...addr,
      id: "addr_" + Math.random().toString(36).substr(2, 9)
    };
    return {
      user: {
        ...state.user,
        savedAddresses: [...state.user.savedAddresses, newAddress]
      }
    };
  })
}));
