import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-subtitle">NEW COLLECTION</p>

        <h1>
          Dresses That Define <br /> You
        </h1>

        <p className="hero-text">
          Elegant, feminine dresses for every occasion.
          <br />
          Discover your perfect look.
        </p>

        <Link to="/shop" className="hero-btn">
          Shop Now
        </Link>
      </div>
    </section>
  );
}

export default Hero;
