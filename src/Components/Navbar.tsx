import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser, FiX, FiMenu } from "react-icons/fi";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import "./Navbar.css";

type Profile = {
  username?: string | null;
  first_name?: string | null;
  role?: string | null;
};

function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { cart } = useCart();
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const fetchProfile = async (userId: string) => {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("username, first_name, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      setProfile(null);
      return;
    }

    setProfile(profileData);
  };

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Failed to read auth user:", error.message);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
        return;
      }

      const currentUser = data.user ?? null;
      if (!mounted) return;

      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
        return;
      }
      setProfile(null);
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setShowMenu(false);

      if (nextUser) {
        await fetchProfile(nextUser.id);
        return;
      }
      setProfile(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout failed. Please try again.");
      return;
    }
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account?")) return;
    if (!user) return;

    const { data, error } = await supabase.functions.invoke("delete-account", {
      body: {},
    });

    if (error) {
      console.error("Delete account failed:", error.message);
      alert(`Delete account failed: ${error.message}`);
      return;
    }

    if (data?.error) {
      console.error("Delete account failed:", data.error);
      alert(`Delete account failed: ${data.error}`);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShowMenu(false);
    closeMobile();
    navigate("/");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  const normalizedRole = profile?.role?.toString().trim().toLowerCase();
  const isAdmin = normalizedRole === "admin";

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/">ASIKA</Link>
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/shop">Shop</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>

        <div className="nav-icons">
          <FiSearch className="nav-icon search-icon" onClick={() => setShowSearch(!showSearch)} />

          <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
            <FiShoppingBag className="nav-icon" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>

          {user ? (
            <div className="profile-wrapper" ref={menuRef}>
              <FiUser className="nav-icon profile-icon" onClick={() => setShowMenu(!showMenu)} />
              {showMenu && (
                <div className="dropdown">
                  <p className="username">{profile?.username || profile?.first_name || user.email}</p>
                  <Link to="/profile" onClick={() => setShowMenu(false)}>
                    My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setShowMenu(false)}>
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="admin-link" onClick={() => setShowMenu(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout}>Logout</button>
                  <button className="delete" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}

          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      <div className={`mobile-overlay ${mobileOpen ? "open" : ""}`} onClick={closeMobile}>
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <span className="mobile-logo">ASIKA</span>
            <button className="mobile-close" onClick={closeMobile}>
              <FiX />
            </button>
          </div>

          <ul className="mobile-links">
            <li>
              <Link to="/" onClick={closeMobile}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" onClick={closeMobile}>
                Shop
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMobile}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMobile}>
                Contact
              </Link>
            </li>
          </ul>

          <div className="mobile-divider" />

          {user ? (
            <div className="mobile-user">
              <p className="mobile-username">{profile?.username || profile?.first_name || user.email}</p>
              <Link to="/profile" onClick={closeMobile}>
                My Profile
              </Link>
              <Link to="/orders" onClick={closeMobile}>
                My Orders
              </Link>
              {isAdmin && (
                <Link to="/admin" className="mobile-admin-link" onClick={closeMobile}>
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  closeMobile();
                  handleLogout();
                }}
              >
                Logout
              </button>
              <button
                className="mobile-delete"
                onClick={() => {
                  closeMobile();
                  handleDeleteAccount();
                }}
              >
                Delete Account
              </button>
            </div>
          ) : (
            <Link to="/login" className="mobile-login-btn" onClick={closeMobile}>
              Login
            </Link>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="search-overlay">
          <div className="search-overlay-inner">
            <FiSearch className="search-overlay-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for dresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <FiX />
              </button>
            )}
            <button className="search-submit" onClick={handleSearch}>
              Search
            </button>
            <button className="search-close" onClick={handleSearchClose}>
              <FiX />
            </button>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
}

export default Navbar;
