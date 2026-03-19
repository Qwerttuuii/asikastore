import { useCart } from "../context/CartContext";
import { useState, useRef } from "react";
import Footer from "../Components/Footer";
import { PaystackButton } from "react-paystack";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [formValid, setFormValid] = useState(false); 
  const [loading, setLoading] = useState(false);

  const referenceRef = useRef(`ref_${new Date().getTime()}`);

  const subtotal = cart.reduce(
    (total, item) => total + item.products.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const publicKey = "pk_test_a8bc65e1fb932ae32da70a0b8854a31ca682035d";

  const validateForm = () => {
    const newErrors: any = {};
    if (!firstName.trim()) newErrors.firstName = "Required";
    if (!lastName.trim()) newErrors.lastName = "Required";
    if (!email.trim()) newErrors.email = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    if (!address.trim()) newErrors.address = "Required";
    setErrors(newErrors);
    if (cart.length === 0) {
      alert("Your cart is empty");
      return false;
    }
    const valid = Object.keys(newErrors).length === 0;
    setFormValid(valid);
    return valid;
  };

  const paystackConfig = {
    reference: referenceRef.current,
    email: email,
    amount: Math.round(total * 100),
    publicKey,
  };

  const handleClose = () => {
    alert("Transaction cancelled");
  };

  const handleSuccess = async (reference: any) => {
    setLoading(true);

    try {
      console.log("Paystack reference:", reference);

      // STEP 1: Verify payment via edge function
      const verify = await fetch(
        "https://vdmausjznhrruzhjjeuh.functions.supabase.co/verify-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ reference: reference.reference }),
        }
      );

      if (!verify.ok) {
        const errText = await verify.text();
        console.error("Verify response error:", errText);
        alert("Payment verification failed. Please contact support.");
        return;
      }

      const verifyData = await verify.json();
      console.log("VERIFY DATA:", verifyData);

      if (!verifyData?.data || verifyData.data.status !== "success") {
        alert("Payment could not be verified. Please contact support.");
        return;
      }

      // STEP 2: Get logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        alert("You must be logged in to complete a purchase.");
        return;
      }

      // STEP 3: Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          email: user.email,
          reference: reference.reference,
          total: total,
        })
        .select()
        .single();

      if (orderError) {
        alert(`Order failed: ${orderError.message}`);
        return;
      }

      // STEP 4: Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price,
        first_name: firstName,
      }));

      const { error: itemError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemError) {
        alert(`Items failed: ${itemError.message}`);
        return;
      }

      // STEP 5: Clear cart
      await supabase.from("cart").delete().eq("user_id", user.id);

      // STEP 6: Navigate to success
      navigate("/order-success");

    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="checkout-page">
        <div className="checkout-header">
          <a href="/shop" className="back-link">← Back to shop</a>
          <h1>Checkout</h1>
          <p className="checkout-sub">Complete your order — you're almost there!</p>
        </div>

        <div className="checkout-container">
          <div className="checkout-form">
            <h2>Contact Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 XXX XXX XXXX"
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            {loading && <p style={{ color: "#888" }}>Processing your order...</p>}

            {!formValid ? (
              <button className="payment-btn" onClick={validateForm}>
                Continue to Payment →
              </button>
            ) : (
              <PaystackButton
                {...paystackConfig}
                text="Pay Now"
                className="payment-btn"
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            )}
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            {cart.map((item) => (
              <div key={item.id} className="summary-item">
                <img src={item.products.image} alt={item.products.name} />
                <div className="summary-info">
                  <p>{item.products.name}</p>
                  <span>{item.quantity} × ${item.products.price}</span>
                </div>
                <p>${(item.products.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="discount">
              <input placeholder="Discount code" />
              <button>Apply</button>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
     
          </div>
     
        </div>
     
      </div>
      <Footer />
    </>
  );
}
