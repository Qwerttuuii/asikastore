import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./OrderSuccess.css";

export default function OrderSuccess() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 200);
  }, []);

  return (
    <div className="success-page">

      <div className={`success-card ${show ? "show" : ""}`}>

        {/* CHECK ICON */}
        <div className="success-icon">
          ✓
        </div>

        <h1>Payment Successful</h1>
        <p>Your order has been placed successfully.</p>

        <div className="success-actions">
          <Link to="/shop" className="btn-outline">
            Continue Shopping
          </Link>

          <Link to="/orders" className="btn-primary">
            View Orders
          </Link>
        </div>

      </div>

    </div>
  );
}