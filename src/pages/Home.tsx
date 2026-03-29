import Hero from "../Components/Hero";
import CollectionShowcase from "../Components/CollectionShowcase";
import FeaturedProducts from "../Components/FeaturedProducts";
import Footer from "../Components/Footer";
import AboutAsika from "../Components/AboutAsika";
import NewsletterSignup from "../Components/NewsletterSignup";
import { useSeo } from "../lib/useSeo";

function Home() {
  useSeo({
    title: "ASIKA | Elegant Women's Dresses",
    description:
      "Shop timeless dresses from ASIKA. Discover curated casual, midi, maxi, and evening styles designed for confident women.",
    path: "/",
    image: "/asika-logo.jpeg",
  });

  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CollectionShowcase />
      <AboutAsika />
      <NewsletterSignup />
      <Footer />
    </>
  );
}

export default Home;
