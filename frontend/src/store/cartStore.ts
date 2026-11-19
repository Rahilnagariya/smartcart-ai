import { create } from 'zustand';

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  imageUrl: string;
  isAiSuggested?: boolean;
}

interface CartState {
  items: CartItem[];
  cartPulse: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  addMultipleItems: (items: Omit<CartItem, 'quantity'>[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  triggerPulse: () => void;
}

// Helper to load cart from LocalStorage
const loadSavedCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('smartcart_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadSavedCart(),
  cartPulse: false,
  triggerPulse: () => {
    set({ cartPulse: true });
    setTimeout(() => set({ cartPulse: false }), 400);
  },
  addItem: (product, quantity = 1) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.productId === product.productId);
    
    let newItems: CartItem[] = [];
    if (existingIndex > -1) {
      newItems = [...currentItems];
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems = [...currentItems, { ...product, quantity }];
    }

    localStorage.setItem('smartcart_cart', JSON.stringify(newItems));
    set({ items: newItems });
    get().triggerPulse();
  },
  addMultipleItems: (products) => {
    const currentItems = [...get().items];
    
    products.forEach((prod) => {
      const idx = currentItems.findIndex((item) => item.productId === prod.productId);
      if (idx > -1) {
        currentItems[idx].quantity += 1;
        // Keep the AI Suggested flag if it is recommended
        if (prod.isAiSuggested) currentItems[idx].isAiSuggested = true;
      } else {
        currentItems.push({ ...prod, quantity: 1 });
      }
    });

    localStorage.setItem('smartcart_cart', JSON.stringify(currentItems));
    set({ items: currentItems });
    get().triggerPulse();
  },
  removeItem: (productId) => {
    const filtered = get().items.filter((item) => item.productId !== productId);
    localStorage.setItem('smartcart_cart', JSON.stringify(filtered));
    set({ items: filtered });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const updated = get().items.map((item) => 
      item.productId === productId ? { ...item, quantity } : item
    );
    localStorage.setItem('smartcart_cart', JSON.stringify(updated));
    set({ items: updated });
  },
  clearCart: () => {
    localStorage.removeItem('smartcart_cart');
    set({ items: [] });
  }
}));
