import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>ASIKA</h3>
          <p>Elegant dresses designed for the modern woman.</p>
        </div>

        <div>
          <h4>SHOP</h4>
          <p>Casual Dresses</p>
          <p>Evening Dresses</p>
          <p>Midi Dresses</p>
          <p>Maxi Dresses</p>
        </div>

        <div>
          <h4>COMPANY</h4>
          <p>About</p>
          <p>Sustainability</p>
          <p>Careers</p>
        </div>

        <div>
          <h4>SUPPORT</h4>
          <p>Contact</p>
          <p>Shipping</p>
          <p>Returns</p>
          <p>FAQ</p>
        </div>
      </div>

      <div className="copyright">
        (c) 2026 ASIKA. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
