import Hero from "../Components/Hero";
import CollectionShowcase from "../Components/CollectionShowcase";
import FeaturedProducts from "../Components/FeaturedProducts";
import Footer from "../Components/Footer";
import AboutAsika from "../Components/AboutAsika";
import NewsletterSignup from "../Components/NewsletterSignup";

function Home() {
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
