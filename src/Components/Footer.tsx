import "./Footer.css";
const logo = "/ASIKA LOGO.avif";



const shopLinks = [
  { label: "All Dresses",     href: "/shop" },
  { label: "Casual Dresses",  href: "/shop/casual" },
  { label: "Evening Dresses", href: "/shop/evening" },
  { label: "Midi Dresses",    href: "/shop/midi" },
  { label: "Maxi Dresses",    href: "/shop/maxi" },
  { label: "Bridal",          href: "/shop/bridal" },
  { label: "Bespoke",         href: "/bespoke" },
];

const companyLinks = [
  { label: "About ASIKA",    href: "/about" },
  { label: "Our Story",      href: "/about#story" },
  { label: "Sustainability", href: "/about#sustainability" },
  { label: "Careers",        href: "/careers" },
  { label: "Press & Media",  href: "/press" },
];

const supportLinks = [
  { label: "Contact Us",        href: "/contact" },
  { label: "Sizing Guide",      href: "/sizing" },
  { label: "Shipping Info",     href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "FAQ",               href: "/faq" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy",   href: "/privacy" },
  { label: "Cookie Policy",    href: "/cookies" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">

      {/* ── TOP — brand + newsletter ───────────────────────────────────── */}
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <img src={logo} alt="ASIKA" className="footer-logo-img" />

          <p className="footer-tagline">
            Elegant dresses designed for the modern woman.
            Crafted in Nigeria, worn worldwide.
          </p>

          {/* Socials */}
          <div className="footer-socials">
            <a href="https://instagram.com/iwearasika"
               target="_blank" rel="noopener noreferrer"
               aria-label="Instagram" className="footer-social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://twitter.com/iwearasika"
               target="_blank" rel="noopener noreferrer"
               aria-label="X / Twitter" className="footer-social-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://facebook.com/iwearasika"
               target="_blank" rel="noopener noreferrer"
               aria-label="Facebook" className="footer-social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="i.wear.asika@gmail.com"
               aria-label="Email" className="footer-social-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* ── MIDDLE — nav columns ──────────────────────────────────────── */}
      <div className="footer-cols">
        <div className="footer-col">
          <p className="footer-col-title">Shop</p>
          <ul>
            {shopLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="footer-link">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="footer-col-title">Company</p>
          <ul>
            {companyLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="footer-link">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="footer-col-title">Support</p>
          <ul>
            {supportLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="footer-link">{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <p className="footer-col-title">Contact</p>
          <div className="footer-contact-items">
            <a href="mailto:i.wear.asika@gmail.com" className="footer-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              i.wear.asika@gmail.com
            </a>
            <a href="https://instagram.com/iwearasika" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              @iwearasika
            </a>
            <div className="footer-contact-item footer-contact-nolink">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Abuja, Nigeria
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM — legal bar ────────────────────────────────────────── */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {year} ASIKA. All rights reserved. Made with ♥ in Nigeria.
        </p>
        <div className="footer-legal-links">
          {legalLinks.map(({ label, href }) => (
            <a key={label} href={href} className="footer-legal-link">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
