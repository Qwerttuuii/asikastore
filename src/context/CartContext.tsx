import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Product = {
  id: string
  name: string
  price: number
  image: string
}

type CartItem = {
  id: string
  quantity: number
  products: Product
}

type CartContextType = {
  cart: CartItem[]
  fetchCart: () => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }

  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {

  const [cart, setCart] = useState<CartItem[]>([])

  const fetchCart = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("cart")
      .select(`
        id,
        quantity,
        products (
          id,
          name,
          price,
          image
        )
      `)
      .eq("user_id", user.id)

    if (!error && data) {
      setCart(data as unknown as CartItem[])
    }

  }

  // REMOVE ITEM (Optimistic update)
  const removeItem = async (id: string) => {

    setCart(prev => prev.filter(item => item.id !== id))

    await supabase
      .from("cart")
      .delete()
      .eq("id", id)

  }

  // UPDATE QUANTITY (Optimistic update)
  const updateQuantity = async (id: string, quantity: number) => {

    if (quantity < 1) return

    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    )

    await supabase
      .from("cart")
      .update({ quantity })
      .eq("id", id)

  }

  // CLEAR ENTIRE CART
  const clearCart = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // clear UI instantly
    setCart([])

    // remove all user's cart items from DB
    await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id)

  }

  const refreshCart = async () => {
    await fetchCart()
  }

  useEffect(() => {
    fetchCart()
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        removeItem,
        updateQuantity,
        refreshCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
