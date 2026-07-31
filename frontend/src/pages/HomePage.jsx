import { useState } from "react";
import Hero from "../components/HeroBanner";
import QuickActionCards from "../components/QuickActionCards";
import PromoCarousel from "../components/home/PromoCarousel";
import CategorySection from "../components/CategorySection";
import CouponCarousel from "../components/CouponCarousel";
import WhyChooseWellMeds from "../components/WhyChooseWellMeds";
import UploadPrescriptionBanner from "../components/UploadPrescriptionBanner";
import WellnessProductsSection from "../components/WellnessProductsSection";
import SurgicalProductsSection from "../components/SurgicalProductsSection";
import HealthSupplementsSection from "../components/HealthSupplementsSection";
import GLP1ProductsSection from "../components/GLP1ProductsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ConsultationModal from "../components/ConsultationModal";
import HomeSectionContainer from "../components/layout/HomeSectionContainer";
import LazySection from "../components/common/LazySection";
import SEO from "../components/common/SEO";

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://wellmeds.in/#organization",
      "name": "WellMeds",
      "url": "https://wellmeds.in",
      "logo": "https://wellmeds.in/favicon.png",
      "description": "India's trusted online pharmacy delivering authentic prescription medicines, cold-chain biologicals, surgical supplies, and specialty healthcare directly to your doorstep.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-800-WELLMEDS",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi", "Marathi"]
      }
    },
    {
      "@type": "Pharmacy",
      "@id": "https://wellmeds.in/#pharmacy",
      "name": "WellMeds Specialty Pharmacy",
      "url": "https://wellmeds.in",
      "telephone": "+91-800-WELLMEDS",
      "priceRange": "₹₹",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Baner Main Road, High Street",
        "addressLocality": "Baner, Pune",
        "addressRegion": "Maharashtra",
        "postalCode": "411045",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 18.5590,
        "longitude": 73.7868
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://wellmeds.in/#website",
      "url": "https://wellmeds.in",
      "name": "WellMeds",
      "description": "Buy Medicines & Healthcare Supplies Online",
      "publisher": {
        "@id": "https://wellmeds.in/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://wellmeds.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

const HomePage = () => {
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="WellMeds Specialty Pharmacy | Authentic Medicines & Medical Supplies"
        description="WellMeds is India's trusted online pharmacy delivering authentic prescription medicines, wellness products, surgical devices, and specialty healthcare directly to your doorstep."
        keywords="online pharmacy, buy medicines online, prescription drugs, surgical supplies, wellness products, medical equipment India"
        schema={homeSchema}
      />

      {/* Hero Banner — UNCHANGED (Design System Source of Truth) */}
      <Hero />

      {/* Quick Action Cards Section */}
      <HomeSectionContainer className="mt-7 md:mt-9">
        <QuickActionCards />
      </HomeSectionContainer>

      {/* Promotional Banners Carousel */}
      <HomeSectionContainer className="mt-8 md:mt-10">
        <PromoCarousel />
      </HomeSectionContainer>

      {/* Active Coupons Carousel */}
      <CouponCarousel />

      {/* Shop by Category strip */}
      <CategorySection />

      {/* Surgical Devices / OTC Catalog Strip */}
      <SurgicalProductsSection />

      {/* Upload Rx Prescription Banner */}
      <UploadPrescriptionBanner />
      
      <LazySection minHeight="300px">
        <WellnessProductsSection />
      </LazySection>

      {/* Below the fold lazy sections */}
      <LazySection minHeight="250px">
        <TestimonialsSection />
      </LazySection>


      <LazySection minHeight="300px">
        <HealthSupplementsSection />
      </LazySection>

      <LazySection minHeight="300px">
        <GLP1ProductsSection />
      </LazySection>

      <LazySection minHeight="200px">
        <WhyChooseWellMeds />
      </LazySection>

      {/* Pharmacist Consultation Details Form Modal */}
      <ConsultationModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
