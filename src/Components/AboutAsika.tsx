import React from 'react';
import { Link } from 'react-router-dom';
import './AboutAsika.css';

const AboutAsika: React.FC = () => {
  return (
    <section className="about-asika">
      {/* Background Image Container */}
      <div className="about-asika__background">
        <img 
          src="/about-asika.avif"    
          alt="Asika Brand Story" 
          className="about-asika__image"
        />
        <div className="about-asika__overlay" />
      </div>

      {/* Content */}
      <div className="about-asika__content">
        <div className="about-asika__decoration">
          OUR STORY 
        </div>

        <h2 className="about-asika__title">
          Every piece tells<br />a story.
        </h2>

        <div className="about-asika__text">
          <p>
            Asika was born from a deep appreciation for timeless design and 
            authentic self-expression. We create clothing that transcends trends
            pieces that feel as good as they look.
          </p>
          <p>
            Rooted in minimalism and crafted with intention, every garment carries 
            the spirit of quiet confidence and effortless elegance.
          </p>
        </div>

        <Link to="/about" className="about-asika__button">
          Read Our Full Story
        </Link>
      </div>
    </section>
  );
};

export default AboutAsika;
