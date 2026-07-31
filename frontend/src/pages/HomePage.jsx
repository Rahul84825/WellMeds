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
      "@id": "https://wellmeds.com/#organization",
      "name": "WellMeds",
      "url": "https://wellmeds.com",
      "logo": "https://wellmeds.com/assets/logos/logo.png",
      "description": "Online pharmacy and healthcare partner offering genuine prescription medicines, wellness essentials, and surgical supplies across India.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-800-WELLMEDS",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://wellmeds.com/#website",
      "url": "https://wellmeds.com",
      "name": "WellMeds",
      "description": "Buy Medicines & Healthcare Supplies Online",
      "publisher": {
        "@id": "https://wellmeds.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://wellmeds.com/search?q={search_term_string}",
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
