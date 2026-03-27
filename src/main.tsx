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
          gutter={12}
          toastOptions={{
            duration: 2600,
            className: "asika-toast",
            style: {
              background: "#111111",
              color: "#faf9f7",
              borderRadius: "14px",
              border: "1px solid rgba(232, 98, 26, 0.18)",
              boxShadow: "0 18px 50px rgba(17, 17, 17, 0.18)",
              padding: "14px 16px",
            },
            success: {
              iconTheme: {
                primary: "#e8621a",
                secondary: "#faf9f7",
              },
            },
            error: {
              duration: 3200,
              iconTheme: {
                primary: "#e8621a",
                secondary: "#faf9f7",
              },
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
