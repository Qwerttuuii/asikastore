import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; //  added useLocation

import Navbar from "./Components/Navbar";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Shop = lazy(() => import("./pages/Shop"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const PageLoader = () => (
  <div className="asika-page-loader" role="status" aria-live="polite">
    Loading...
  </div>
);

function App() {

  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // hide navbar on auth pages
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/admin" ||
    pathname === "/verify-email" ||
    pathname === "/reset-password" ||
    pathname === "/order-success";

  return (
    <>
      {/* condition added here */}
      {!hideNavbar && <Navbar />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
