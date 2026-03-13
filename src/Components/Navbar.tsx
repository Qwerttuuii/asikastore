import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {

  const [isCartOpen, setIsCartOpen] = useState(false);

  // get cart from global context
  const { cart } = useCart();

  // calculate total quantity
  const cartCount = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  return (
    <>
      <nav className="navbar">

        <div className="nav-logo">
          <Link to="/">ASIKA</Link>
        </div>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className="nav-icons">

          <FiSearch />

          <div
            id="cart-icon"
            className="cart-icon"
            onClick={() => setIsCartOpen(true)}
          >
            <FiShoppingBag />
            <span className="cart-count">{cartCount}</span>
          </div>

          <FiUser />

        </div>

      </nav>

      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}

export default Navbar;