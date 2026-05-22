import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: number;
  productId: number;
  name: string;
  sku?: string;
  price: number;
  image: string;
  quantity: number;
  message?: string;
  variantLabel?: string;
  deliveryPincode?: string;
  deliveryArea?: string;
  deliveryCity?: string;
  addOns?: Array<{
    id: string | number;
    name: string;
    price: number;
  }>;
  slug: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const itemAddOns = item.addOns?.map((addOn) => addOn.id).sort().join("|") ?? "";
          const existing = state.items.find((i) => {
            const existingAddOns = i.addOns?.map((addOn) => addOn.id).sort().join("|") ?? "";
            return (
              i.productId === item.productId &&
              i.variantLabel === item.variantLabel &&
              i.message === item.message &&
              existingAddOns === itemAddOns
            );
          });
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      getCount: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: "velvet-whisk-cart" }
  )
);
