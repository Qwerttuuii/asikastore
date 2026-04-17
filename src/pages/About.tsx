import "./About.css";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import { useEffect } from "react";
import { useSeo } from "../lib/useSeo"; // ✅ ADD THIS

export default function About() {

  // ✅ SEO
  useSeo({
    title: "About ASIKA | Our Story & Vision",
    description:
      "Learn about ASIKA, a womenswear brand in Abuja, Nigeria focused on timeless fashion, craftsmanship, and intentional design.",
    path: "/about",
  });

  //  FADE-IN ANIMATION
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".fade-up, .fade-left, .fade-right"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // PARALLAX HERO
  useEffect(() => {
    const hero = document.querySelector(".about-hero") as HTMLElement;

    const handleScroll = () => {
      if (!hero) return;
      hero.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-overlay" />

        <div className="about-hero-content">
          <Link to="/" className="back-btn">Back to Home</Link>

          <div className="hero-text">
            <p className="hero-label">Our Story</p>

            <h1 className="reveal-text">
              <span>Designed with intention,</span><br />
              <span>built to last beyond</span><br />
              <span>trends.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="about-manifesto fade-up">
        <div className="container">
          <p className="about-label">Manifesto</p>

          <h1 className="about-title">
            We believe a wardrobe should be a slow,
            deliberate act, <span>not a feed to scroll, but a story to live in.</span>
          </h1>

          <p className="about-text">
            ASIKA was born from a simple frustration: too many beautiful clothes,
            too few that mattered. We design pieces with weight in fabric, in cut,
            in intention. Every collection is small. Every detail is considered.
            Nothing is here by accident.
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="about-story">
        <div className="container story-split">

          <div className="story-text fade-left">
            <h2>Our Story</h2>

            <p>
              Asika is a womenswear brand in Abuja, Nigeria. We design and
              sew outfits like dresses, pants, tops, and laces for women.
              The vision was to cater to all body types by providing affordable
              clothing for women.
            </p>

            <p>
              The brand started in 2016 and is owned by two sisters,
              Ilobi Nini Onyinyechi Maduka and Ilobi Meme Chinemerem.
              ASIKA is not about fast fashion. It is about restraint,
              precision, and quiet confidence.
            </p>

            <p>
              We focus on silhouettes that feel timeless,
              materials that age beautifully, and designs
              that speak without shouting.
            </p>
          </div>

          <div className="story-image fade-right">
            <img src="/ourstory.avif" alt="ASIKA craftsmanship and tailoring process" /> {/* ✅ improved alt */}
          </div>

        </div>
      </section>

      {/* ── FOUNDERS ── */}
      <section className="founders fade-up">

        <div className="founders-header">
          <div className="founders-heading">
            <p className="founders-label">FOUNDERS</p>

            <h2>
              Two minds, <span className="italic">one vision</span>
            </h2>
          </div>

          <p className="founders-desc">
            ASIKA is led by two creative directors who share every decision from the first sketch to the final stitch.
          </p>
        </div>

        <div className="founders-grid">

          <div className="founder-card fade-up">
            <div className="founder-image">
              <img src="/founder1.avif" alt="Ilobi Meme Chinemerem - ASIKA Founder" />
              <div className="image-gradient" />

              <div className="founder-overlay">
                <span className="founder-role">FOUNDER</span>
                <h3>Ilobi Meme Chinemerem</h3>
              </div>
            </div>

            <div className="founder-text">
              <div className="line" />
              <p>
                Leads design and silhouette with precision, believing each piece should feel intentional and lasting.
              </p>
            </div>
          </div>

          <div className="founder-card fade-up">
            <div className="founder-image">
              <img src="/founder2.avif" alt="Ilobi Nini Onyinyechi Maduka - ASIKA Co-Founder" />
              <div className="image-gradient" />

              <div className="founder-overlay">
                <span className="founder-role">CO-FOUNDER</span>
                <h3>Ilobi Nini Onyinyechi Maduka</h3>
              </div>
            </div>

            <div className="founder-text">
              <div className="line" />
              <p>
                Oversees production and craftsmanship, ensuring every piece moves from concept to creation with care.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}