import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
         <Toaster 
    position="top-right"
    toastOptions={{
      duration: 2000,
      style: {
        background: "#111",
        color: "#fff",
        borderRadius: "8px"
      }
    }}
  />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
