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
};

function ProductPage() {

  const { id } = useParams();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProduct();
  }, []);

  const getProduct = async () => {

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProduct(data);
  };

  const addToCart = async () => {

    if (!product) return;

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
      .eq("product_id", product.id)
      .maybeSingle();

    if (existingItem) {

      await supabase
        .from("cart")
        .update({
          quantity: existingItem.quantity + 1
        })
        .eq("id", existingItem.id);

    } else {

      await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });

    }

    toast.success("Added to cart ✓");
    refreshCart();
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-page">

      <div className="product-container">

        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-info">

          <h1>{product.name}</h1>

          <p className="price">₦{product.price}</p>

          <p className="description">
            {product.description}
          </p>

          <button
            className="add-cart-btn"
            onClick={addToCart}
          >
            Add to Cart
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductPage;
