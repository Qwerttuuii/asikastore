import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import ProductCard from "../Components/ProductCard"
import Footer from "../Components/Footer"
import { useLocation, useNavigate } from "react-router-dom";
import { useSeo } from "../lib/useSeo";
import "./Shop.css"

const PAGE_SIZE = 12;

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
  const [page, setPage] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const search = query.get("search")?.toLowerCase() || "";

  useSeo({
    title: "Shop Dresses | ASIKA Collection",
    description:
      "Browse ASIKA's curated dress collection including casual, midi, maxi, and evening dresses.",
    path: "/shop",
    image: "/shop.avif",
  });

  useEffect(() => {
    if (page !== 0) {
      setPage(0)
      return
    }

    getProducts()
  }, [category, search])

  useEffect(() => {
    if (page > 0) {
      getProducts()
    }
  }, [page])

  const getProducts = async () => {
    setLoading(true)
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let queryBuilder = supabase
      .from("products")
      .select("id, name, price, image, Category", { count: "exact" })
      .order("name", { ascending: true })
      .range(from, to)

    if (category !== "all") {
      queryBuilder = queryBuilder.eq("Category", category)
    }

    if (search) {
      queryBuilder = queryBuilder.ilike("name", `%${search}%`)
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    if (data) {
      if (page === 0) {
        setProducts(data as Product[])
      } else {
        setProducts((current) => [...current, ...(data as Product[])])
      }
    }

    setTotalProducts(count ?? 0)
    setLoading(false)
  }

  const hasMoreProducts = products.length < totalProducts;

  // Clicking any filter clears the search param from URL
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    navigate("/shop");
  };

  return (
    <>
      <div className="shop">
        {/* HERO */}
        <div className="shop-hero">
          <p className="shop-subtitle">CURATED COLLECTION</p>
          <h1>The Shop</h1>
          <p className="shop-desc">
            Discover timeless silhouettes crafted with intention 
            from effortless day dresses to statement evening wear.
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="shop-filters">
          <div className="filter-buttons">
            <button
              className={category === "all" ? "active" : ""}
              onClick={() => handleCategoryChange("all")}
            >
              ALL
            </button>
            <button
              className={category === "casual" ? "active" : ""}
              onClick={() => handleCategoryChange("casual")}
            >
              CASUAL DRESSES
            </button>
            <button
              className={category === "evening" ? "active" : ""}
              onClick={() => handleCategoryChange("evening")}
            >
              EVENING DRESSES
            </button>
            <button
              className={category === "midi" ? "active" : ""}
              onClick={() => handleCategoryChange("midi")}
            >
              MIDI DRESSES
            </button>
            <button
              className={category === "maxi" ? "active" : ""}
              onClick={() => handleCategoryChange("maxi")}
            >
              MAXI DRESSES
            </button>
          </div>
          <div className="filter-info">
            {loading && page === 0 ? "Loading..." : `${totalProducts} pieces`}
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
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          )}
        </div>

        {!loading && products.length === 0 && (
          <div className="shop-empty">
            <h3>No pieces found</h3>
            <p>Try another category or search term.</p>
          </div>
        )}

        {hasMoreProducts && (
          <div className="shop-load-more">
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={loading}>
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}

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
