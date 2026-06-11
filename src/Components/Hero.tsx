import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import Lenis from "@studio-freight/lenis";
import "./Hero.css";

const slides = [
  {
    // Desktop image (landscape crop)
    image: "/asikahero1.avif",
    // Mobile image (portrait crop — swap path when you have mobile versions)
    imageMobile: "/firstimg.avif",
    eyebrow: "New Collection — 2026",
    headline: "Dressed to\nBe Remembered.",
    sub: "Timeless silhouettes crafted for the woman who moves through the world with intention.",
    cta: "Explore Collection",
    href: "/shop",
  },
  {
    image: "/asikahero2.avif",
    imageMobile: "/secimg.avif",
    eyebrow: "Evening Wear",
    headline: "The Night\nBelongs to You.",
    sub: "Statement dresses for the moments that matter most — elegant, bold, unforgettable.",
    cta: "Shop Evening",
    href: "/shop/evening",
  },
  {
    image: "/asikahero3.avif",
    imageMobile: "/thdimg.avif",
    eyebrow: "Everyday Luxury",
    headline: "Your Style,\nYour Story.",
    sub: "Effortless pieces that carry you from morning to evening without missing a beat.",
    cta: "Shop Now",
    href: "/shop",
  },
];

const SLIDE_DURATION = 5500;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const eyebrowRef  = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const btnRef      = useRef<HTMLAnchorElement>(null);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, []);

  const animateIn = () => {
    const els = [eyebrowRef.current, headlineRef.current, subRef.current, btnRef.current];
    gsap.fromTo(
      els,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, stagger: 0.11, ease: "power3.out" }
    );
  };

  useEffect(() => { animateIn(); }, []);

  useEffect(() => {
    timerRef.current = setTimeout(
      () => goTo((current + 1) % slides.length),
      SLIDE_DURATION
    );
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current]);

  const goTo = (index: number) => {
    if (transitioning || index === current) return;
    setTransitioning(true);
    setPrev(current);
    const els = [eyebrowRef.current, headlineRef.current, subRef.current, btnRef.current];
    gsap.to(els, {
      y: -20,
      opacity: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: "power2.in",
      onComplete: () => {
        setCurrent(index);
        setTransitioning(false);
        setPrev(null);
        setTimeout(animateIn, 60);
      },
    });
  };

  const slide = slides[current];
  // Pick image based on screen size
  const bgImage = isMobile ? slide.imageMobile : slide.image;

  return (
    <section className="hero" aria-label="Hero banner">

      {/* SLIDES — uses correct image per breakpoint */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={`hero-slide ${i === current ? "active" : ""} ${i === prev ? "prev" : ""}`}
          style={{
            // CSS custom property so the media query in CSS can also override
            "--img-desktop": `url(${s.image})`,
            "--img-mobile":  `url(${s.imageMobile})`,
            backgroundImage: i === current ? `url(${bgImage})` : undefined,
          } as React.CSSProperties}
          aria-hidden={i !== current}
        />
      ))}

      {/* OVERLAYS */}
      <div className="hero-overlay" />
      <div className="hero-fog" />

      {/* CONTENT */}
      <div className="hero-content">
        <p className="hero-eyebrow" ref={eyebrowRef}>{slide.eyebrow}</p>

        <h1 className="hero-headline" ref={headlineRef}>
          {slide.headline.split("\n").map((line, i) => (
            <span key={i} className="hero-headline-line">
              {i === 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h1>

        <p className="hero-sub" ref={subRef}>{slide.sub}</p>

        <Link to={slide.href} className="hero-btn" ref={btnRef}>
          {slide.cta}
          <span className="hero-btn-arrow">→</span>
        </Link>
      </div>

      {/* BOTTOM BAR */}
      <div className="hero-bottom-bar">
        <div className="hero-indicators" aria-label="Slide navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className="hero-dot-fill"
                style={i === current ? { animationDuration: `${SLIDE_DURATION}ms` } : {}}
              />
            </button>
          ))}
        </div>

        <div className="hero-counter" aria-hidden="true">
          <span className="hero-counter-current">0{current + 1}</span>
          <span className="hero-counter-sep" />
          <span className="hero-counter-total">0{slides.length}</span>
        </div>
      </div>

      {/* SCROLL HINT — desktop only */}
      <div className="hero-scroll-hint" aria-hidden="true">
        <span className="hero-scroll-line" />
        <p>Scroll</p>
      </div>

    </section>
  );
}