import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./FeaturedProducts.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
};

function FeaturedProducts() {
  const flyToCart = (imageUrl: string) => {
    const cart = document.getElementById("cart-icon");
    if (!cart) return;

    const cartRect = cart.getBoundingClientRect();

    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.position = "fixed";
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.zIndex = "9999";
    img.style.borderRadius = "10px";
    img.style.left = "50%";
    img.style.top = "50%";
    img.style.transition = "all 0.8s ease";

    document.body.appendChild(img);

    setTimeout(() => {
      img.style.left = cartRect.left + "px";
      img.style.top = cartRect.top + "px";
      img.style.width = "20px";
      img.style.height = "20px";
      img.style.opacity = "0.5";
    }, 50);

    setTimeout(() => {
      img.remove();
    }, 800);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const { refreshCart } = useCart();

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").limit(4);

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }

    if (data) {
      setProducts(data);
    }
  };

  const addToCart = async (productId: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      toast.error("Please login first");
      return;
    }

    const { data: existingItem } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from("cart")
        .update({
          quantity: existingItem.quantity + 1,
        })
        .eq("id", existingItem.id);

      if (error) {
        console.error(error);
        toast.error("Failed to update cart");
        return;
      }
    } else {
      const { error } = await supabase.from("cart").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      });

      if (error) {
        console.error(error);
        toast.error("Failed to add to cart");
        return;
      }
    }

    toast.success("Added to cart");
    refreshCart();
  };

  return (
    <section className="featured">
      <div className="featured-header">
        <div className="featured-copy">
          <span className="featured-kicker">Featured Collection</span>
          <h2>Our Collection</h2>
          <p>Your most loved dresses</p>
        </div>

        <Link to="/shop" className="view-all">
          View All
        </Link>
      </div>

      <div className="featured-grid">
        {products.map((product) => (
          <article className="featured-card" key={product.id}>
            <Link to={`/product/${product.id}`} className="featured-link">
              <div className="featured-image-wrap">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
              </div>
            </Link>

            <button
              type="button"
              className="featured-add-cart"
              onClick={() => {
                flyToCart(product.image);
                addToCart(product.id);
              }}
            >
              Add to Cart
            </button>

            <div className="featured-meta">
              <h4>{product.name}</h4>
              <p>N{product.price}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
