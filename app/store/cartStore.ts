import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number;
  nombre: string;
  precio: string;
  precioNum: number;
  imagen: string;
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  agregar: (item: Omit<CartItem, 'cantidad'>) => void;
  quitar: (id: number) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item) => {
        const items = get().items;
        const existe = items.find(i => i.id === item.id);
        if (existe) {
          set({ items: items.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i) });
        } else {
          set({ items: [...items, { ...item, cantidad: 1 }] });
        }
      },

      quitar: (id) => set({ items: get().items.filter(i => i.id !== id) }),

      cambiarCantidad: (id, cantidad) => {
        if (cantidad < 1) return;
        set({ items: get().items.map(i => i.id === id ? { ...i, cantidad } : i) });
      },

      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.precioNum * i.cantidad, 0),
      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: 'tiendatuc-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);