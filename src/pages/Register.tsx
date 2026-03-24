import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const buildVerifyEmailUrl = () => {
    const params = new URLSearchParams({
      email,
      firstName,
      lastName,
      username,
    });

    return `${window.location.origin}/verify-email?${params.toString()}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      // CHECK IF USERNAME EXISTS
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        alert("Username already taken");
        setLoading(false);
        return;
      }

      // CREATE AUTH USER — no profile insert here
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildVerifyEmailUrl(),
          data: {
            first_name: firstName,
            last_name: lastName,
            username,
          },
        },
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // PASS USER DATA TO VERIFY PAGE VIA URL PARAMS
      // Profile will be created AFTER OTP verification
      navigate(
        `/verify-email?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&username=${encodeURIComponent(username)}`
      );

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">ASIKA</Link>
          <h2 className="auth-left-title">Your style,<br />your story.</h2>
          <p className="auth-left-sub">
            Join thousands of women who trust ASIKA for curated fashion that speaks for itself.
          </p>
          <div className="auth-left-dots">
            <span className="auth-dot" />
            <span className="auth-dot auth-dot-active" />
            <span className="auth-dot" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field-row">
              <div className="auth-field">
                <label className="auth-label">First Name</label>
                <input
                  className="auth-input"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Last Name</label>
                <input
                  className="auth-input"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                placeholder="@janedoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-btn-spinner" /> Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>or</p>
            <span />
          </div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
