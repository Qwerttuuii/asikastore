import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import ProductCard from "../Components/ProductCard"
import Footer from "../Components/Footer"
import "./Shop.css"

type Product = {
  id: string
  name: string
  price: number
  image: string
  Category: string
}

export default function Shop() {

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
  }, [])

  const getProducts = async () => {

    setLoading(true)

    const { data, error } = await supabase
      .from("products")
      .select("*")

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    if (data) {
      setProducts(data)
    }

    setLoading(false)
  }

  const filteredProducts =
    category === "all"
      ? products
      : products.filter((p) => p.Category === category)

  return (
    <>
      <div className="shop">

        {/* HERO */}
        <div className="shop-hero">

          <p className="shop-subtitle">CURATED COLLECTION</p>

          <h1>The Shop</h1>

          <p className="shop-desc">
            Discover timeless silhouettes crafted with intention —
            from effortless day dresses to statement evening wear.
          </p>

        </div>


        {/* FILTER BAR */}
        <div className="shop-filters">

          <div className="filter-buttons">

            <button
              className={category === "all" ? "active" : ""}
              onClick={() => setCategory("all")}
            >
              ALL
            </button>

            <button
              className={category === "casual" ? "active" : ""}
              onClick={() => setCategory("casual")}
            >
              CASUAL DRESSES
            </button>

            <button
              className={category === "evening" ? "active" : ""}
              onClick={() => setCategory("evening")}
            >
              EVENING DRESSES
            </button>

            <button
              className={category === "midi" ? "active" : ""}
              onClick={() => setCategory("midi")}
            >
              MIDI DRESSES
            </button>

            <button
              className={category === "maxi" ? "active" : ""}
              onClick={() => setCategory("maxi")}
            >
              MAXI DRESSES
            </button>

          </div>

          <div className="filter-info">
            {loading ? "Loading..." : `${filteredProducts.length} pieces`}
          </div>

        </div>


        {/* PRODUCTS */}
        <div className="shop-grid">

          {loading ? (

            <>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </>

          ) : (

            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))

          )}

        </div>


        {/* BOTTOM MESSAGE */}
        <div className="shop-bottom">

          <h3>Can't find what you're looking for?</h3>

          <p>New styles added weekly. Stay tuned.</p>

        </div>

      </div>

      <Footer />

    </>
  )
}