import { useCart } from "../context/CartContext";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./CartDrawer.css";

type Props = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

function CartDrawer({ isOpen, setIsOpen }: Props) {
  const { cart, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (total, item) => total + item.products.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="cart-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>

        {/* Header */}
        <div className="cart-header">
          <h3>Your Cart</h3>

          <FiX
            className="close-icon"
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Items */}
        <div className="cart-items">

          {cart.length === 0 && (
            <p className="empty">Your cart is empty</p>
          )}

          {cart.map((item) => (

            <div key={item.id} className="cart-item">

              <img
                src={item.products?.image}
                alt={item.products?.name}
              />

              <div className="item-info">

                <div className="item-top">

                  <h4>{item.products?.name}</h4>

                  <FiX
                    className="remove-icon"
                    onClick={() => removeItem(item.id)}
                  />

                </div>

                <p className="price">
                  ${item.products?.price}
                </p>

                <div className="quantity">

                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateQuantity(item.id, item.quantity - 1);
                      }
                    }}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* Footer */}
        <div className="cart-footer">

          <div className="subtotal">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
          >
            Checkout
          </button>

          <p className="shipping-note">
            Shipping & taxes calculated at checkout
          </p>

        </div>

      </div>
    </>
  );
}

export default CartDrawer;