import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSeo } from "../lib/useSeo";
import "./Auth.css";

type PendingRegistration = {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

const getPendingRegistration = (): PendingRegistration | null => {
  const rawPending = sessionStorage.getItem("asika_pending_registration");
  if (!rawPending) return null;

  try {
    return JSON.parse(rawPending) as PendingRegistration;
  } catch {
    sessionStorage.removeItem("asika_pending_registration");
    return null;
  }
};

const VerifyEmail = () => {
  useSeo({
    title: "Verify Email | ASIKA",
    description: "Verify your ASIKA account email address.",
    path: "/verify-email",
    robots: "noindex, nofollow",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const pendingRegistration = useMemo(() => getPendingRegistration(), []);

  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !pendingRegistration || pendingRegistration.email !== email) {
      toast.error("Registration session expired. Please sign up again.");
      navigate("/register", { replace: true });
    }
  }, [email, pendingRegistration, navigate]);

  const buildOtpPayload = (code: string) => ({
    email,
    code,
    used: false,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      if (!pendingRegistration || pendingRegistration.email !== email) {
        toast.error("Registration session expired. Please sign up again.");
        navigate("/register");
        return;
      }

      const { data: completeRegistrationData, error: completeRegistrationError } = await supabase.functions.invoke(
        "complete-registration",
        {
          body: {
            email,
            password: pendingRegistration.password,
            firstName: pendingRegistration.firstName,
            lastName: pendingRegistration.lastName,
            username: pendingRegistration.username,
            otp,
          },
        },
      );

      if (completeRegistrationError) {
        console.error("Complete registration error:", completeRegistrationError);
        const functionMessage =
          completeRegistrationData &&
          typeof completeRegistrationData === "object" &&
          "error" in completeRegistrationData
            ? String(completeRegistrationData.error)
            : completeRegistrationError.message;
        toast.error(functionMessage || "We could not finish creating your account. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Email verified successfully.");
      sessionStorage.removeItem("asika_pending_registration");
      navigate("/login?verified=true");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: insertError } = await supabase
        .from("otp_codes")
        .insert(buildOtpPayload(newOtp));

      if (insertError) {
        console.error("Resend OTP save error:", insertError);
        toast.error("Failed to create a new code. Please try again.");
        return;
      }

      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: {
          email,
          otp: newOtp,
          name: pendingRegistration?.firstName || "",
          subject: "Your new ASIKA verification code",
        },
      });

      if (!error) {
        toast.success("A new code has been sent to your email.");
      } else {
        console.error("Resend OTP error:", error);
        toast.error("Failed to resend. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">ASIKA</Link>
          <h2 className="auth-left-title">Check your<br />inbox.</h2>
          <p className="auth-left-sub">
            We sent a 6-digit verification code to your email. Enter it below to activate your account.
          </p>
          <div className="auth-left-dots">
            <span className="auth-dot" />
            <span className="auth-dot" />
            <span className="auth-dot auth-dot-active" />
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">
              A 6-digit code was sent to{" "}
              <strong style={{ color: "#111" }}>{email}</strong>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleVerify}>
            <div className="auth-field">
              <label className="auth-label">Verification Code</label>
              <input
                className="auth-input auth-otp-input"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <p className="auth-field-hint">Check your spam folder if you don't see it</p>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-btn-spinner" /> Verifying...
                </span>
              ) : "Verify Email"}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>or</p>
            <span />
          </div>

          <p className="auth-switch">
            Didn't receive a code?{" "}
            <button
              className="auth-resend-btn"
              type="button"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>

          <p className="auth-switch" style={{ marginTop: "12px" }}>
            Wrong email?{" "}
            <Link to="/Register">Go back</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
