import React from "react";
import { Link } from "react-router-dom";

const CheckIcon = () => (
  <svg
    className="w-[18px] h-[18px] text-[#038076] shrink-0 mt-[6px]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const HealthcareInformation = () => {
  return (
    <section className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 py-10 md:py-16 lg:py-[80px] transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop text-left space-y-10 md:space-y-12">
        
        {/* Section 1 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            WellMeds – Your Trusted Partner for Life-Saving Medicines & Specialized Healthcare
          </h2>
          <h3 className="text-lg md:text-xl font-bold text-[#038076] dark:text-primary-fixed-dim">
            India’s Trusted Destination for Specialty Medicines
          </h3>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            At WellMeds, we believe that every patient deserves timely access to genuine, high-quality medicines, regardless of where they live. We are committed to making specialty healthcare simple, affordable, and accessible by providing authentic medicines for complex and chronic medical conditions across India.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            From <Link to="/products?speciality=oncology" className="text-[#038076] dark:text-primary-fixed-dim hover:underline font-semibold">cancer therapies</Link> and <Link to="/products?category=Prescription" className="text-[#038076] dark:text-primary-fixed-dim hover:underline font-semibold">transplant medicines</Link> to <Link to="/products?category=Prescription" className="text-[#038076] dark:text-primary-fixed-dim hover:underline font-semibold">HIV treatment</Link>, rare disease medications, critical care injections, and specialty pharmaceuticals, WellMeds serves patients with compassion, reliability, and professional pharmaceutical expertise.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Our goal is simple—to ensure that no patient has to delay treatment because of medicine availability.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Extensive Range of Specialty Medicines
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            WellMeds offers one of the most comprehensive collections of specialty medicines and healthcare products, including:
          </p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-[10px] gap-x-6 text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/products?speciality=oncology" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Cancer Medicines
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/products?category=Prescription" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Kidney Transplant Medicines
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/products?category=Prescription" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Liver & Heart Transplant Medicines
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>HIV & Antiviral Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Critical Care Injections</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Antibiotics & Antifungal Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Nephrology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Cardiology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Neurology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Rheumatology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Gastroenterology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Endocrinology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Pulmonology Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Rare Disease Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Osteoporosis Treatments</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Hormonal Therapies</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Fertility Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Vaccines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/surgical" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Surgical Products
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/products?category=Medical Devices" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Medical Devices
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/products?category=Supplements" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Nutritional Supplements
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/wellness" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Wellness & Preventive Healthcare Products
                </Link>
              </span>
            </li>
          </ul>

          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            Whether you need a single prescription medicine or ongoing therapy for chronic treatment, WellMeds is here to support your healthcare journey.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Genuine Medicines You Can Trust
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Every medicine supplied by WellMeds is sourced only from authorized manufacturers and licensed pharmaceutical distributors. We maintain strict quality standards to ensure every product reaches you in its original condition with complete authenticity.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            When you purchase from WellMeds, you receive:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-[10px] gap-x-6 text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>100% Genuine Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Proper Storage & Handling</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Verified Supply Chain</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Original Manufacturer Packaging</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Safe & Secure Delivery</span>
            </li>
          </ul>

          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            Your health deserves nothing less than complete confidence.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Specialized Care Beyond Medicine Delivery
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            WellMeds is more than an online pharmacy. We understand that specialty treatments often require guidance, timely availability, and continuous support. Our experienced pharmacy team assists patients and caregivers throughout the medicine procurement process.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Our services include:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-[10px] gap-x-6 text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Assistance in sourcing difficult-to-find medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Specialty medicine support</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Prescription verification</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Patient counselling</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Medicine availability assistance</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Treatment continuity support</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Home delivery assistance</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Bulk institutional medicine support</span>
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Fast, Safe & Reliable Medicine Delivery
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Healthcare cannot wait. Our streamlined order management system helps ensure medicines are packed carefully and dispatched quickly while maintaining pharmaceutical storage standards.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Every order is handled with care to preserve medicine quality during transit. Whether you’re ordering from a metro city or a smaller town, WellMeds strives to make specialty medicines accessible whenever you need them.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Why Thousands Trust WellMeds
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Patients, caregivers, hospitals, doctors, and healthcare professionals choose WellMeds because we prioritize quality, transparency, and patient care.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] font-semibold">
            Why Choose WellMeds?
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-[10px] gap-x-6 text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Genuine & Authentic Medicines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Wide Range of Specialty Pharmaceuticals</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Oncology & Transplant Medicine Experts</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Trusted Pharmacy Support</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Competitive Pricing</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Secure Ordering Process</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Fast Delivery Across India</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Reliable Customer Assistance</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Professional Prescription Handling</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Dedicated Patient-Centric Service</span>
            </li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Complete Healthcare Under One Roof
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Along with prescription medicines, WellMeds also offers a growing range of healthcare essentials, including:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-[10px] gap-x-6 text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/surgical" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Surgical Supplies
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Medical Equipment</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Diabetes Care Products</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Blood Pressure Monitors</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Orthopedic Supports</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Nutrition & Protein Supplements</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Vitamins & Minerals</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Personal Care Products</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>
                <Link to="/wellness" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Wellness Products
                </Link>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckIcon />
              <span>Home Healthcare Essentials</span>
            </li>
          </ul>

          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] pt-2">
            Our mission is to become your trusted destination for complete healthcare needs.
          </p>
        </div>

        {/* Section 8 */}
        <div className="space-y-4 max-w-5xl">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Making Healthcare Accessible
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Serious illnesses require timely treatment, and access to medicines should never become an obstacle. At WellMeds, we continuously work towards improving medicine availability, simplifying the ordering process, and delivering dependable pharmaceutical services to patients across India.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            From the first prescription to every refill, our commitment remains the same—providing authentic medicines with professional care and reliable support.
          </p>
        </div>

        {/* Section 9 */}
        <div className="space-y-4 max-w-5xl pb-2">
          <h2 className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-[#0F172A] dark:text-zinc-100 tracking-tight leading-tight">
            Your Health. Our Responsibility.
          </h2>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            At WellMeds, every order represents a patient waiting for treatment, a family seeking hope, and a promise to deliver healthcare with integrity.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9]">
            Whether you are searching for life-saving medicines, specialty pharmaceuticals, chronic disease treatments, or everyday healthcare products, WellMeds is committed to providing a safe, trusted, and seamless pharmacy experience.
          </p>
          <p className="text-[18px] text-[#475569] dark:text-zinc-400 leading-[1.9] font-medium">
            Choose WellMeds for genuine medicines, expert support, and dependable healthcare—because your health deserves the very best.
          </p>
        </div>

      </div>
    </section>
  );
};

export default HealthcareInformation;
