import { Link } from "react-router-dom";
import "./CollectionShowcase.css";

function CollectionShowcase() {
  return (
    <section className="collection-showcase">
      <article className="collection-tile">
        <img src="/model1.avif" alt="Model wearing a new release from Asika" />
        <div className="collection-copy">
          <p className="collection-kicker">Latest Drop</p>
          <h3>New Releases</h3>
          <p className="collection-text">
            Fresh silhouettes designed for effortless elegance, refined detail, and everyday confidence.
          </p>
          <Link to="/shop" className="collection-link">
            Explore Now
          </Link>
        </div>
      </article>

      <article className="collection-tile">
        <img src="/model2.avif" alt="Model styling pieces from the new Asika collection" />
        <div className="collection-copy">
          <p className="collection-kicker">Season Edit</p>
          <h3>Explore Our New Collection</h3>
          <p className="collection-text">
            Discover modern pieces shaped by the Asika brand language: clean, feminine, and quietly striking.
          </p>
          <Link to="/shop" className="collection-link">
            Explore Now
          </Link>
        </div>
      </article>
    </section>
  );
}

export default CollectionShowcase;
