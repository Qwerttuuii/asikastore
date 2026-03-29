import { useCart } from "../context/CartContext";
import { useState, useRef, useEffect } from "react";
import Footer from "../Components/Footer";
import { PaystackButton } from "react-paystack";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSeo } from "../lib/useSeo";
import "./Checkout.css";

export default function Checkout() {
  useSeo({
    title: "Checkout | ASIKA",
    description: "Complete your ASIKA order securely.",
    path: "/checkout",
    robots: "noindex, nofollow",
  });

  const { cart } = useCart();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const referenceRef = useRef(`ref_${new Date().getTime()}`);

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        toast.error("Please login to continue.");
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, address, phone")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setEmail(profile.email || data.user.email || "");
        setAddress(profile.address || "");
        setPhone(profile.phone || "");
      }
    };

    initUser();
  }, [navigate]);

  const subtotal = cart.reduce((total, item) => total + (item?.products?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

  const validateForm = () => {
    const newErrors: any = {};

    if (!firstName.trim()) newErrors.firstName = "Required";
    if (!lastName.trim()) newErrors.lastName = "Required";
    if (!email.trim()) newErrors.email = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    if (!address.trim()) newErrors.address = "Required";

    setErrors(newErrors);

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }

    if (!publicKey) {
      toast.error("Payment is temporarily unavailable. Please contact support.");
      return false;
    }

    const valid = Object.keys(newErrors).length === 0;
    if (valid) setStep(2);
    return valid;
  };

  const paystackConfig = {
    reference: referenceRef.current,
    email: email || "test@email.com",
    amount: Math.round(total * 100),
    publicKey,
  };

  const handleClose = () => {
    toast("Transaction cancelled.", { icon: "-" });
  };

  const handleSuccess = async (reference: any) => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const verifyRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ reference: reference.reference }),
      });

      let verifyData: any = null;
      try {
        verifyData = await verifyRes.json();
      } catch {
        verifyData = null;
      }

      if (!verifyRes.ok) {
        const reason = verifyData?.error || verifyData?.message || `HTTP ${verifyRes.status}`;
        console.error("verify-payment HTTP error:", verifyRes.status, verifyData);
        toast.error(`Payment verification failed: ${reason}`);
        return;
      }

      if (verifyData?.data?.status !== "success") {
        toast.error(
          `Payment verification failed: ${verifyData?.data?.gateway_response || "Transaction not successful"}`,
        );
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User not found.");
        return;
      }

      await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          address,
          phone,
        })
        .eq("id", user.id);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          email: user.email,
          reference: reference.reference,
          total,
        })
        .select()
        .single();

      if (orderError) {
        toast.error(orderError.message);
        return;
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item?.products?.id,
        quantity: item.quantity,
        price: item?.products?.price || 0,
      }));

      await supabase.from("order_items").insert(orderItems);
      await supabase.from("cart").delete().eq("user_id", user.id);

      navigate("/order-success");
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="checkout-page">
        <div className="checkout-header">
          <a href="/shop" className="back-link">Back to shop</a>
          <h1>Checkout</h1>
          <p className="checkout-sub">Complete your order - you're almost there!</p>

          <div className="checkout-steps">
            <div className={`step ${step === 1 ? "active" : ""}`}>
              <span>1</span> Information
            </div>

            <div className="step-line"></div>

            <div className={`step ${step === 2 ? "active" : ""}`}>
              <span>2</span> Payment
            </div>
          </div>
        </div>

        <div className="checkout-container">
          <div className="checkout-form">
            <h2>Contact Information</h2>

            {step === 1 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    {errors.firstName && <span className="error">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    {errors.lastName && <span className="error">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} />
                  {errors.address && <span className="error">{errors.address}</span>}
                </div>

                <button className="payment-btn" onClick={validateForm}>
                  Continue to Payment
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p style={{ marginBottom: "20px", color: "#666" }}>You're almost done. Complete your payment.</p>

                <button className="btn-outline" onClick={() => setStep(1)}>
                  Back
                </button>

                {loading && <p className="asika-inline-loader">Processing payment...</p>}

                <PaystackButton
                  {...paystackConfig}
                  text={loading ? "Processing..." : "Pay Now"}
                  className="payment-btn"
                  onSuccess={handleSuccess}
                  onClose={handleClose}
                  disabled={loading || !publicKey}
                />
              </>
            )}
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>

            {cart.length === 0 ? (
              <p style={{ color: "#777" }}>Your cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="summary-item">
                  <img src={item?.products?.image || "/placeholder.png"} alt={item?.products?.name || "product"} />

                  <div className="summary-info">
                    <p>{item?.products?.name || "Unnamed Product"}</p>
                    <span>
                      {item.quantity} x N{item?.products?.price || 0}
                    </span>
                  </div>

                  <p>N{((item?.products?.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              ))
            )}

            <div className="summary-row">
              <span>Subtotal</span>
              <span>N{subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Tax</span>
              <span>N{tax.toFixed(2)}</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>N{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
