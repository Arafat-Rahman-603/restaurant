import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedBurgers from '@/components/home/FeaturedBurgers';
import PopularCombos from '@/components/home/PopularCombos';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CustomerReviews from '@/components/home/CustomerReviews';
import SpecialOffers from '@/components/home/SpecialOffers';
import FoodCategories from '@/components/home/FoodCategories';
import Newsletter from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroBanner />
        <FoodCategories />
        <FeaturedBurgers />
        <PopularCombos />
        <WhyChooseUs />
        <SpecialOffers />
        <CustomerReviews />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
