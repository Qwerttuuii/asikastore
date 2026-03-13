import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      {/* You will add the background image in CSS */}

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

        <button className="hero-btn">
          Shop Now →
        </button>
      </div>

    </section>
  );
}

export default Hero;