import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiShoppingBag,
  FiLogOut,
  FiTrash2,
  FiPlus,
  FiArrowLeft,
  FiTag,
  FiImage,
  FiFileText,
  FiSave,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useSeo } from "../lib/useSeo";
import "./AdminDashboard.css";

const BUCKET = "asika storeage"; // your exact bucket name

export default function AdminDashboard() {
  useSeo({
    title: "Admin Dashboard | ASIKA",
    description: "ASIKA admin operations dashboard.",
    path: "/admin",
    robots: "noindex, nofollow",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ADD PRODUCT FORM STATE
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInStock, setFormInStock] = useState(true);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>("");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data } = await supabase
        .from("profiles")
        .select("role, first_name")
        .eq("id", user.id)
        .single();

      const normalizedRole = data?.role?.toString().trim().toLowerCase();
      if (normalizedRole !== "admin") {
        toast.error("Access denied.");
        window.location.href = "/";
        return;
      }
      setAdminProfile({ ...data, email: user.email });
      fetchData();
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: productsData } = await supabase.from("products").select("*");
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`id, total, created_at, email, order_items(quantity)`)
      .order("created_at", { ascending: false });
    const { data: customersData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, created_at")
      .eq("role", "USER");

    setProducts(productsData || []);
    setOrders(ordersData || []);
    setCustomers(customersData || []);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormImageFile(file);
    setFormImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormName("");
    setFormPrice("");
    setFormCategory("");
    setFormDescription("");
    setFormInStock(true);
    setFormImageFile(null);
    setFormImagePreview("");
    setFormError("");
  };

  const handleSaveProduct = async () => {
    setFormError("");

    if (!formName.trim()) { setFormError("Product name is required."); return; }
    if (!formPrice || isNaN(Number(formPrice))) { setFormError("Valid price is required."); return; }
    if (!formCategory) { setFormError("Please select a category."); return; }
    if (!formImageFile) { setFormError("Please upload a product image."); return; }

    setFormSaving(true);

    try {
      // STEP 1: Upload image to Supabase Storage
      const fileExt = formImageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, formImageFile, { upsert: false });

      if (uploadError) {
        setFormError(`Image upload failed: ${uploadError.message}`);
        setFormSaving(false);
        return;
      }

      // STEP 2: Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // STEP 3: Save product to DB
      const { error: insertError } = await supabase.from("products").insert({
        name: formName.trim(),
        price: Number(formPrice),
        Category: formCategory,
        description: formDescription.trim(),
        image: imageUrl,
      });

      if (insertError) {
        setFormError(`Failed to save product: ${insertError.message}`);
        setFormSaving(false);
        return;
      }

      // SUCCESS
      resetForm();
      setShowAddForm(false);
      setTab("products");
      fetchData();

    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    }

    setFormSaving(false);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const recentOrders = orders.slice(0, 5);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const shortId = (id: string) => id.slice(0, 8).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <FiGrid size={16} /> },
    { key: "products", label: "Products", icon: <FiPackage size={16} /> },
    { key: "orders", label: "Orders", icon: <FiShoppingCart size={16} /> },
    { key: "customers", label: "Customers", icon: <FiUsers size={16} /> },
  ];

  const selectTab = (nextTab: string) => {
    setTab(nextTab);
    setShowAddForm(false);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="adm-loading">
        <div className="adm-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="adm-shell">
      <button
        className={`adm-mobile-backdrop ${sidebarOpen ? "open" : ""}`}
        type="button"
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="adm-sidebar-logo">
          <Link to="/">ASIKA</Link>
        </div>
        <nav className="adm-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`adm-nav-item ${tab === item.key && !showAddForm ? "active" : ""}`}
              onClick={() => selectTab(item.key)}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <p className="adm-admin-label">Admin</p>
          <p className="adm-admin-email">{adminProfile?.email}</p>
          <button className="adm-signout" onClick={handleLogout}>
            <FiLogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="adm-main">
        <div className="adm-mobile-topbar">
          <button
            className="adm-mobile-menu-btn"
            type="button"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <p className="adm-mobile-title">Admin Panel</p>
        </div>

        {/* ── ADD PRODUCT FORM ── */}
        {showAddForm && (
          <>
            <div className="adm-form-header">
              <button className="adm-back-btn" onClick={() => { setShowAddForm(false); resetForm(); }}>
                <FiArrowLeft size={16} />
              </button>
              <div>
                <h1 className="adm-page-title" style={{ margin: 0 }}>Add New Product</h1>
                <p className="adm-form-subtitle">Fill in the details below to add a product</p>
              </div>
            </div>

            <div className="adm-form-card">
              {/* ORANGE TOP ACCENT */}
              <div className="adm-form-accent" />

              <div className="adm-form-body">
                {/* PRODUCT NAME */}
                <div className="adm-field">
                  <label className="adm-label">
                    <FiTag size={14} className="adm-label-icon adm-label-orange" />
                    Product Name <span className="adm-required">*</span>
                  </label>
                  <input
                    className="adm-input"
                    placeholder="e.g. Satin Slip Dress"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                {/* PRICE + CATEGORY */}
                <div className="adm-field-row">
                  <div className="adm-field">
                    <label className="adm-label">
                      <span className="adm-label-currency">₦</span>
                      Price <span className="adm-required">*</span>
                    </label>
                    <input
                      className="adm-input"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                    />
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">
                      <FiPackage size={14} className="adm-label-icon adm-label-orange" />
                      Category <span className="adm-required">*</span>
                    </label>
                    <select
                      className="adm-input adm-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="">Select category</option>
                      <option value="casual">Casual Dresses</option>
                      <option value="evening">Evening Dresses</option>
                      <option value="midi">Midi Dresses</option>
                      <option value="maxi">Maxi Dresses</option>
                    </select>
                  </div>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="adm-field">
                  <label className="adm-label">
                    <FiImage size={14} className="adm-label-icon adm-label-orange" />
                    Product Image <span className="adm-required">*</span>
                  </label>
                  <label className="adm-upload-zone">
                    {formImagePreview ? (
                      <img src={formImagePreview} alt="Preview" className="adm-image-preview" />
                    ) : (
                      <div className="adm-upload-placeholder">
                        <FiImage size={32} className="adm-upload-icon" />
                        <p className="adm-upload-text">Click to upload image</p>
                        <p className="adm-upload-hint">JPG, PNG, WEBP supported</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                  {formImagePreview && (
                    <button
                      className="adm-remove-image"
                      onClick={() => { setFormImageFile(null); setFormImagePreview(""); }}
                    >
                      Remove image
                    </button>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div className="adm-field">
                  <label className="adm-label">
                    <FiFileText size={14} className="adm-label-icon adm-label-orange" />
                    Description
                  </label>
                  <textarea
                    className="adm-input adm-textarea"
                    placeholder="Describe your product..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* IN STOCK TOGGLE */}
                <div className="adm-toggle-row">
                  <div>
                    <p className="adm-toggle-label">In Stock</p>
                    <p className="adm-toggle-hint">Product is available for purchase</p>
                  </div>
                  <label className="adm-toggle">
                    <input
                      type="checkbox"
                      checked={formInStock}
                      onChange={(e) => setFormInStock(e.target.checked)}
                    />
                    <span className="adm-toggle-slider" />
                  </label>
                </div>

                {/* ERROR */}
                {formError && <p className="adm-form-error">{formError}</p>}

                {/* SAVE BUTTON */}
                <button
                  className="adm-save-btn"
                  onClick={handleSaveProduct}
                  disabled={formSaving}
                >
                  {formSaving ? (
                    "Saving..."
                  ) : (
                    <><FiSave size={16} /> Save Product</>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── DASHBOARD TAB ── */}
        {!showAddForm && tab === "dashboard" && (
          <>
            <h1 className="adm-page-title">Dashboard</h1>
            <div className="adm-stats">
              <div className="adm-stat-card">
                <div className="adm-stat-top">
                  <span className="adm-stat-label">Total Revenue</span>
                  <span className="adm-stat-icon adm-icon-orange">₦</span>
                </div>
                <p className="adm-stat-value">₦{totalRevenue.toLocaleString()}</p>
                <p className="adm-stat-change">All time</p>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-top">
                  <span className="adm-stat-label">Orders</span>
                  <span className="adm-stat-icon"><FiShoppingBag size={18} /></span>
                </div>
                <p className="adm-stat-value">{orders.length}</p>
                <p className="adm-stat-change">Total orders</p>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-top">
                  <span className="adm-stat-label">Products</span>
                  <span className="adm-stat-icon"><FiPackage size={18} /></span>
                </div>
                <p className="adm-stat-value">{products.length}</p>
                <p className="adm-stat-change">In catalogue</p>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-top">
                  <span className="adm-stat-label">Customers</span>
                  <span className="adm-stat-icon"><FiUsers size={18} /></span>
                </div>
                <p className="adm-stat-value">{customers.length}</p>
                <p className="adm-stat-change">Registered users</p>
              </div>
            </div>
            <div className="adm-section">
              <h2 className="adm-section-title">Recent Orders</h2>
              <div className="adm-table-wrap adm-table-no-border">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="adm-mono">#{shortId(o.id)}</td>
                        <td>{o.email || "—"}</td>
                        <td>{o.order_items?.length || 0}</td>
                        <td>₦{Number(o.total).toFixed(2)}</td>
                        <td><span className="adm-badge adm-badge-confirmed">Confirmed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── PRODUCTS TAB ── */}
        {!showAddForm && tab === "products" && (
          <>
            <div className="adm-page-header">
              <div>
                <h1 className="adm-page-title" style={{ margin: 0 }}>Products</h1>
                <p className="adm-page-count">{products.length} products</p>
              </div>
              <button className="adm-add-btn" onClick={() => setShowAddForm(true)}>
                <FiPlus size={16} /> Add Product
              </button>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="adm-product-cell">
                          <img src={p.image} alt={p.name} className="adm-product-thumb" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.Category || "—"}</td>
                      <td>₦{Number(p.price).toFixed(2)}</td>
                      <td><span className="adm-badge adm-badge-instock">In Stock</span></td>
                      <td>
                        <button className="adm-delete-btn" onClick={() => deleteProduct(p.id)} title="Delete">
                          <FiTrash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {!showAddForm && tab === "orders" && (
          <>
            <div className="adm-page-header">
              <div>
                <h1 className="adm-page-title" style={{ margin: 0 }}>Orders</h1>
                <p className="adm-page-count">{orders.length} orders</p>
              </div>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="adm-mono">#{shortId(o.id)}</td>
                      <td>{o.email || "—"}</td>
                      <td>{formatDate(o.created_at)}</td>
                      <td>{o.order_items?.length || 0}</td>
                      <td>₦{Number(o.total).toFixed(2)}</td>
                      <td><span className="adm-badge adm-badge-confirmed">Confirmed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── CUSTOMERS TAB ── */}
        {!showAddForm && tab === "customers" && (
          <>
            <div className="adm-page-header">
              <div>
                <h1 className="adm-page-title" style={{ margin: 0 }}>Customers</h1>
                <p className="adm-page-count">{customers.length} customers</p>
              </div>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const initials = `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`.toUpperCase() || "?";
                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="adm-customer-cell">
                            <div className="adm-avatar">{initials}</div>
                            <span>{c.first_name} {c.last_name}</span>
                          </div>
                        </td>
                        <td>{c.email}</td>
                        <td>{formatDate(c.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

