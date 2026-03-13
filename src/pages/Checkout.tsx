import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {

  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const subtotal = cart.reduce(
    (total, item) => total + item.products.price * item.quantity,
    0
  );

  const handleOrder = async () => {

    if (!name || !email) {
      alert("Please fill all fields");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    /* 1️⃣ create order */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name,
          email: email,
          total: subtotal
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      alert("Order failed");
      return;
    }

    /* 2️⃣ insert order items */

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price: item.products.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error(itemsError);
      alert("Order items failed");
      return;
    }

    /* 3️⃣ clear cart */

    clearCart();

    alert("Order placed successfully!");

    navigate("/");

  };

  return (

    <div className="checkout-page">

      <h1>Checkout</h1>

      <div className="checkout-container">

        {/* FORM */}

        <div className="checkout-form">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleOrder}>
            Place Order
          </button>

        </div>

        {/* ORDER SUMMARY */}

        <div className="order-summary">

          <h2>Order Summary</h2>

          {cart.map((item) => (

            <div key={item.id} className="summary-item">

              <span>{item.products.name}</span>

              <span>
                {item.quantity} × ${item.products.price}
              </span>

            </div>

          ))}

          <div className="summary-total">

            <strong>Total</strong>

            <strong>${subtotal.toFixed(2)}</strong>

          </div>

        </div>

      </div>

    </div>

  );
}