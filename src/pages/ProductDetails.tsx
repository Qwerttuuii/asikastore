import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import Footer from "../Components/Footer"
import ProductCard from "../Components/ProductCard"
import "./ProductDetails.css"

type Product = {
  id: string
  name: string
  price: number
  image: string
  Category: string
}

export default function ProductDetails() {

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

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

      // load related products
      getRelatedProducts(data.Category, data.id)
    }
  }

  if (!product) {
    return <p style={{ padding: "100px" }}>Loading...</p>
  }

  return (
    <>
      <div className="product-page">

        {/* BACK BUTTON */}
        <button
          className="back-to-shop-btn"
          onClick={() => navigate(-1)}
        >
          ← Back to Shop
        </button>

        <div className="product-container">

          {/* PRODUCT IMAGE */}
          <div className="product-image-section">
            <img src={product.image} alt={product.name} />
          </div>

          {/* PRODUCT INFO */}
          <div className="product-info-section">

            <h1>{product.name}</h1>

            <p className="product-price">${product.price}</p>

            <p className="product-description">
              Crafted with timeless elegance and attention to detail.
              Designed for effortless style and versatility.
            </p>

            <button className="product-cart-btn">
              Add to Cart
            </button>

          </div>

        </div>

        {/* RELATED PRODUCTS */}
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