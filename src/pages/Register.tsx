import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import "./Auth.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const buildOtpPayload = (otp: string) => ({
    email,
    code: otp,
    used: false,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });

  const sendOTPEmail = async (toEmail: string, otp: string, name: string) => {
    const { error } = await supabase.functions.invoke("send-otp-email", {
      body: {
        email: toEmail,
        otp,
        name,
        subject: "Your ASIKA verification code",
      },
    });

    if (error) {
      console.error("OTP email error:", error);
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        toast.error("Username already taken.");
        setLoading(false);
        return;
      }

      const otp = generateOTP();

      const { error: otpError } = await supabase
        .from("otp_codes")
        .insert(buildOtpPayload(otp));

      if (otpError) {
        console.error("OTP save error:", otpError);
        toast.error("Failed to generate verification code.");
        setLoading(false);
        return;
      }

      const sent = await sendOTPEmail(email, otp, firstName);

      if (!sent) {
        toast.error("Failed to send verification email. Please try again.");
        setLoading(false);
        return;
      }

      navigate(
        `/verify-email?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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
              <div className="auth-password-wrap">
                <input
                  className="auth-input auth-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-btn-spinner" /> Sending code...
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
