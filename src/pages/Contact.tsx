import { useSeo } from "../lib/useSeo";
import { useState } from "react";
import "./Contact.css";
import Footer from "../Components/Footer";

const Contact = () => {
  useSeo({
    title: "Contact ASIKA | Customer Support & Inquiries",
    description:
      "Get in touch with ASIKA for order support, product questions, press, and wholesale inquiries.",
    path: "/contact",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const validateForm = (formData: FormData) => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const messageText = formData.get("message") as string;

    if (!name || name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!messageText || messageText.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!validateForm(formData)) {
      setStatus("idle");
      return;
    }

    try {
      const response = await fetch("https://formspree.io/f/YOUR_FORMSPREE_ID", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you! Your message has been sent successfully.");
        form.reset();
        setErrors({});
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed to send message. Please check your connection.");
    } finally {
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <>
      <div className="contact-page">
        {/* HERO SECTION */}
        <div className="contact-hero">
          <div className="hero-content">
            <span className="accent">GET IN TOUCH</span>
            <h1>Contact Us</h1>
            <p>We’d love to hear from you.</p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="contact-container">
          {/* Left - Form */}
          <div className="contact-form-section">
            <div className="contact-header">
              <span className="accent">WRITE TO US</span>
              <h2>Send a message.</h2>
            </div>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label>NAME</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Your full name" 
                    required 
                    minLength={2}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>EMAIL</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="you@example.com" 
                    required 
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>SUBJECT</label>
                <div className="subject-buttons">
                  <button type="button" className="active">GENERAL</button>
                  <button type="button">ORDER</button>
                  <button type="button">PRESS</button>
                  <button type="button">WHOLESALE</button>
                  <button type="button">OTHER</button>
                </div>
              </div>

              <div className="form-group">
                <label>MESSAGE</label>
                <textarea
                  name="message"
                  rows={7}
                  placeholder="Tell us what's on your mind..."
                  required
                  minLength={10}
                ></textarea>
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="send-button"
                disabled={status === "loading"}
              >
                {status === "loading" ? "SENDING..." : "SEND MESSAGE"}
              </button>

              {message && (
                <p className={`form-message ${status === "success" ? "success" : "error"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Right - Info */}
          <div className="contact-info-section">
            <div className="studio-info">
              <span className="accent">ADDRESS</span>
              <h3>Asika Atelier</h3>
              <p>
                No 57 Yaounde street Wuse Zone 6, Abuja<br />
                Nigeria
              </p>
              <p className="note">Visits by appointment only.</p>
            </div>

            <div className="hours">
              <span className="accent">HOURS</span>
              <div className="hours-list">
                <div className="hours-row">
                  <span>Mon — Fri</span>
                  <span>09:00 — 18:00</span>
                </div>
                <div className="hours-row">
                  <span>Saturday</span>
                  <span>11:00 — 16:00</span>
                </div>
                <div className="hours-row">
                  <span>Sunday</span>
                  <span className="closed">Closed</span>
                </div>
              </div>
            </div>

            <div className="follow">
              <span className="accent">FOLLOW</span>
              <div className="social-icons">
                <a href="https://instagram.com/asika" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href="https://pinterest.com/asika" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                  <PinterestIcon />
                </a>
                <a href="https://tiktok.com/@asika" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/234XXXXXXXXXX" 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
      </a>

      <Footer />
    </>
  );
};

/* SVG Icons */
const InstagramIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.5" />
  </svg>
);

const PinterestIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 20h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4Z" />
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M13 9.5L11 13" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4" />
    <path d="M15 9.5V4h4" />
    <path d="M15 9.5c1.657 0 3 1.343 3 3v.5" />
    <path d="M18 13.5c-1.657 0-3-1.343-3-3" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.485-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 2.7 1.046 5.176 2.776 7.034L4 22l3.062-1.624c1.8.998 3.85 1.55 5.938 1.55 5.523 0 10-4.484 10-10.017C22 6.484 17.523 2 12 2z"/>
  </svg>
);

export default Contact;