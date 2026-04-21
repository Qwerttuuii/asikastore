import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSeo } from "../lib/useSeo";
import "./Orders.css";

const Orders = () => {
  useSeo({
    title: "My Orders | ASIKA",
    description: "View your ASIKA order history.",
    path: "/orders",
    robots: "noindex, nofollow",
  });

  // ✅ Use shared auth — no extra getUser() call
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Wait for auth to resolve before fetching
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total,
          created_at,
          reference,
          order_items (
            quantity,
            price,
            products (
              name,
              image
            )
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) { console.error(error); }
      else { setOrders(data || []); }
      setLoading(false);
    };

    fetchOrders();
  }, [user, authLoading]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  const shortId = (id: string) => id.slice(0, 8).toUpperCase();

  // Show skeleton while auth or data is loading
if (authLoading || loading) {
  return (
    <div className="orders-page">
      <div className="orders-loading">
        <div className="orders-spinner" />
        <p>Loading your orders...</p>
      </div>
    </div>
  );
}

  if (!user) {
    return (
      <div className="orders-page">
        <div className="orders-empty">
          <h2>Please log in</h2>
          <p>You need to be logged in to view your orders.</p>
          <Link to="/login" className="orders-shop-btn">Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* HEADER */}
      <div className="orders-header">
        <Link to="/shop" className="orders-back">← Back to store</Link>
        <div className="orders-title-row">
          <div className="orders-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div>
            <h1>My Orders</h1>
            <p className="orders-subtitle">
              {orders.length === 0
                ? "No orders yet"
                : `${orders.length} order${orders.length > 1 ? "s" : ""} placed`}
            </p>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <h2>No orders yet</h2>
          <p>When you place an order, it will appear here.</p>
          <Link to="/shop" className="orders-shop-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => {
            const isExpanded = expandedOrders.has(order.id);
            const itemCount = order.order_items?.length || 0;
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-accent" />
                <div className="order-meta">
                  <div className="order-meta-left">
                    <span className="order-label">ORDER</span>
                    <span className="order-number">ORD-{String(index + 1).padStart(3, "0")}</span>
                    <span className="order-ref">#{shortId(order.id)}</span>
                  </div>
                  <div className="order-meta-right">
                    <span className="order-label">DATE</span>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                </div>
                <div className="order-divider" />
                <div className="order-items-list">
                  {order.order_items?.slice(0, isExpanded ? undefined : 2).map((item: any, i: number) => (
                    <div key={i} className="order-item">
                      <div className="order-item-img-wrap">
                        <img src={item.products?.image || "/placeholder.png"} alt={item.products?.name} />
                      </div>
                      <div className="order-item-info">
                        <p className="order-item-name">{item.products?.name}</p>
                        <span className="order-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="order-item-price">₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {!isExpanded && itemCount > 2 && (
                    <button className="order-show-more" onClick={() => toggleExpand(order.id)}>
                      +{itemCount - 2} more item{itemCount - 2 > 1 ? "s" : ""}
                    </button>
                  )}
                </div>
                <div className="order-footer">
                  <div className="order-status">
                    <span className="status-dot" />
                    <span className="status-label">Confirmed</span>
                  </div>
                  <div className="order-footer-right">
                    <span className="order-total">₦{Number(order.total).toFixed(2)}</span>
                    <button className="order-toggle-btn" onClick={() => toggleExpand(order.id)}>
                      {isExpanded ? "Hide details" : "View details"}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;