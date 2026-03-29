import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useCart } from "../context/CartContext"
import { toast } from "react-hot-toast"
import "./ProductCard.css"

type Product = {
  id: string
  name: string
  price: number
  image: string
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { refreshCart } = useCart()

  const addToCart = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      toast.error("Please login first")
      return
    }

    const { data: existingItem } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle()

    if (existingItem) {
      await supabase
        .from("cart")
        .update({
          quantity: existingItem.quantity + 1,
        })
        .eq("id", existingItem.id)
    } else {
      await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        })
    }

    toast.success("Added to cart")
    refreshCart()
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        </div>
      </Link>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">N{product.price}</p>
        <button className="add-btn" onClick={addToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  )
}
