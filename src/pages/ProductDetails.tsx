import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { FiArrowLeft, FiLock, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi"
import { toast } from "react-hot-toast"
import { supabase } from "../lib/supabase"
import Footer from "../Components/Footer"
import ProductCard from "../Components/ProductCard"
import { useCart } from "../context/CartContext"
import { useSeo } from "../lib/useSeo"
import "./ProductDetails.css"

type Product = {
  id: string
  name: string
  price: number
  image: string
  Category: string
  description?: string | null
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { refreshCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [addingToCart, setAddingToCart] = useState(false)

  useSeo({
    title: product ? `${product.name} | ASIKA` : "Product Details | ASIKA",
    description: product?.description?.trim()
      ? product.description
      : "View product details, pricing, and related styles from ASIKA's collection.",
    path: `/product/${id || ""}`,
    image: product?.image || "/asika-logo.jpeg",
  });

  useEffect(() => {
    if (id) {
      getProduct()
    }
  }, [id])

  const getRelatedProducts = async (category: string, currentId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("Category", category)
      .neq("id", currentId)
      .limit(4)

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setRelatedProducts(data)
    }
  }

  const getProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
      return
    }

    if (data) {
      setProduct(data)
      getRelatedProducts(data.Category, data.id)
    }
  }

  const addToCart = async () => {
    if (!product || addingToCart) return

    setAddingToCart(true)

    try {
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

      await refreshCart()
      toast.success("Added to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  if (!product) {
    return <p className="product-loading">Loading...</p>
  }

  return (
    <>
      <div className="product-page">
        <button
          className="back-to-shop-btn"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft />
          <span>Back to Shop</span>
        </button>

        <div className="product-container">
          <div className="product-image-section">
            <div className="product-image-frame">
              <div className="product-image-accent" />
              <img src={product.image} alt={product.name} />
            </div>
          </div>

          <div className="product-info-section">
            <p className="product-category">{product.Category}</p>
            <h1>{product.name}</h1>

            <div className="product-price-row">
              <p className="product-price">₦{product.price}</p>
              <span className="product-tax-note">Refined for elevated everyday wear</span>
            </div>

            <p className="product-description">
              {product.description?.trim() ||
                "Crafted with timeless elegance and attention to detail. Designed for effortless style, graceful movement, and a polished finish that feels unmistakably ASIKA."}
            </p>

            <button className="product-cart-btn" onClick={addToCart} disabled={addingToCart}>
              <FiShoppingBag />
              <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
            </button>

            <div className="product-highlights">
              <div className="product-highlight">
                <FiStar />
                <span>Signature silhouette with soft statement energy</span>
              </div>
              <div className="product-highlight">
                <FiTruck />
                <span>Delivery available with local pickup options</span>
              </div>
              <div className="product-highlight">
                <FiLock />
                <span>Secure checkout with smooth order confirmation</span>
              </div>
            </div>

           
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-section">
            <h2>You may also like</h2>

            <div className="related-grid">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
