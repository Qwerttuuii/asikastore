import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import "./ProductPage.css";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  Category: string;
  sizes: string[];
};

function ProductPage() {
  const { id } = useParams();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProduct();
  }, []);

  const getProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error) { console.error(error); return; }
    setProduct(data);
  };

  const addToCart = async () => {
    if (!product) return;

    // Require size selection if product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);

    // Check if same product + same size already in cart
    const query = supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", product.id);

    if (selectedSize) {
      query.eq("size", selectedSize);
    } else {
      query.is("size", null);
    }

    const { data: existingItem } = await query.maybeSingle();

    if (existingItem) {
      await supabase
        .from("cart")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);
    } else {
      await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          size: selectedSize || null,
        });
    }

    toast.success(`Added to cart${selectedSize ? ` — Size ${selectedSize}` : ""} ✓`);
    refreshCart();
    setLoading(false);
  };

  if (!product) return (
    <div className="product-page">
      <div style={{ textAlign: "center", padding: "100px 0", color: "#aaa" }}>Loading...</div>
    </div>
  );

  const hasSizes = product.sizes && product.sizes.length > 0;

  return (
    <div className="product-page">
      <div className="product-container">

        {/* IMAGE */}
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>

        {/* INFO */}
        <div className="product-info">
          {product.Category && (
            <p className="product-category-label">{product.Category}</p>
          )}
          <h1>{product.name}</h1>
          <p className="price">₦{product.price}</p>

          {product.description && (
            <p className="description">{product.description}</p>
          )}

          {/* SIZE SELECTOR */}
          {hasSizes && (
            <div className="size-section">
              <div className="size-header">
                <p className="size-label">Select Size</p>
                {selectedSize && (
                  <span className="size-selected-badge">Size {selectedSize}</span>
                )}
              </div>
              <div className="size-buttons">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? "size-btn-active" : ""}`}
                    onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="size-hint">Please select a size to continue</p>
              )}
              <div className="size-guide">
                <p>US Sizing: 0 (XS) · 2 (XS-S) · 4 (S) · 6 (S-M) · 8 (M) · 10 (M-L) · 12 (L)</p>
              </div>
            </div>
          )}

          {/* ADD TO CART */}
          <button
            className={`add-cart-btn ${hasSizes && !selectedSize ? "add-cart-btn-disabled" : ""}`}
            onClick={addToCart}
            disabled={loading || (hasSizes && !selectedSize)}
          >
            {loading
              ? "Adding..."
              : hasSizes && !selectedSize
              ? "Select a Size"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;