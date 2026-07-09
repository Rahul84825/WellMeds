import React from "react";
import { Link } from "react-router-dom";

const CheckIcon = () => (
  <svg
    className="wellmeds-healthcare-icon"
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
    <section className="wellmeds-healthcare-sec transition-colors duration-300">
      <div className="wellmeds-healthcare-container home-section-container text-left">
        
        {/* Section 1 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-main-heading tracking-tight">
            WellMeds – Your Trusted Partner for Life-Saving Medicines & Specialized Healthcare
          </h2>
          <h3 className="wellmeds-healthcare-sub-heading font-bold">
            India’s Trusted Destination for Specialty Medicines
          </h3>
          <p className="wellmeds-healthcare-para">
            At WellMeds, we believe that every patient deserves timely access to genuine, high-quality medicines, regardless of where they live. We are committed to making specialty healthcare simple, affordable, and accessible by providing authentic medicines for complex and chronic medical conditions across India.
          </p>
          <p className="wellmeds-healthcare-para">
            From <Link to="/products?speciality=oncology" className="text-[#038076] dark:text-primary-fixed-dim hover:underline font-semibold">cancer therapies</Link> and <Link to="/products?category=Prescription" className="text-[#038076] dark:text-primary-fixed-dim hover:underline font-semibold">transplant medicines</Link> to <Link to="/products?category=Prescription" className="text-[#038076] dark:text-primary-fixed-dim hover:underline font-semibold">HIV treatment</Link>, rare disease medications, critical care injections, and specialty pharmaceuticals, WellMeds serves patients with compassion, reliability, and professional pharmaceutical expertise.
          </p>
          <p className="wellmeds-healthcare-para">
            Our goal is simple—to ensure that no patient has to delay treatment because of medicine availability.
          </p>
        </div>

        {/* Section 2 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Extensive Range of Specialty Medicines
          </h2>
          <p className="wellmeds-healthcare-para">
            WellMeds offers one of the most comprehensive collections of specialty medicines and healthcare products, including:
          </p>
          
          <ul className="wellmeds-healthcare-list cols-3">
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/products?speciality=oncology" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Cancer Medicines
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/products?category=Prescription" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Kidney Transplant Medicines
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/products?category=Prescription" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Liver & Heart Transplant Medicines
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>HIV & Antiviral Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Critical Care Injections</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Antibiotics & Antifungal Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Nephrology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Cardiology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Neurology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Rheumatology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Gastroenterology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Endocrinology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Pulmonology Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Rare Disease Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Osteoporosis Treatments</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Hormonal Therapies</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Fertility Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Vaccines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/surgical" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Surgical Products
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/products?category=Medical Devices" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Medical Devices
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/products?category=Supplements" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Nutritional Supplements
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/wellness" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Wellness & Preventive Healthcare Products
                </Link>
              </span>
            </li>
          </ul>

          <p className="wellmeds-healthcare-para pt-2">
            Whether you need a single prescription medicine or ongoing therapy for chronic treatment, WellMeds is here to support your healthcare journey.
          </p>
        </div>

        {/* Section 3 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Genuine Medicines You Can Trust
          </h2>
          <p className="wellmeds-healthcare-para">
            Every medicine supplied by WellMeds is sourced only from authorized manufacturers and licensed pharmaceutical distributors. We maintain strict quality standards to ensure every product reaches you in its original condition with complete authenticity.
          </p>
          <p className="wellmeds-healthcare-para">
            When you purchase from WellMeds, you receive:
          </p>

          <ul className="wellmeds-healthcare-list cols-2">
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>100% Genuine Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Proper Storage & Handling</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Verified Supply Chain</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Original Manufacturer Packaging</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Safe & Secure Delivery</span>
            </li>
          </ul>

          <p className="wellmeds-healthcare-para pt-2">
            Your health deserves nothing less than complete confidence.
          </p>
        </div>

        {/* Section 4 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Specialized Care Beyond Medicine Delivery
          </h2>
          <p className="wellmeds-healthcare-para">
            WellMeds is more than an online pharmacy. We understand that specialty treatments often require guidance, timely availability, and continuous support. Our experienced pharmacy team assists patients and caregivers throughout the medicine procurement process.
          </p>
          <p className="wellmeds-healthcare-para">
            Our services include:
          </p>

          <ul className="wellmeds-healthcare-list cols-2">
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Assistance in sourcing difficult-to-find medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Specialty medicine support</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Prescription verification</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Patient counselling</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Medicine availability assistance</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Treatment continuity support</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Home delivery assistance</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Bulk institutional medicine support</span>
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Fast, Safe & Reliable Medicine Delivery
          </h2>
          <p className="wellmeds-healthcare-para">
            Healthcare cannot wait. Our streamlined order management system helps ensure medicines are packed carefully and dispatched quickly while maintaining pharmaceutical storage standards.
          </p>
          <p className="wellmeds-healthcare-para">
            Every order is handled with care to preserve medicine quality during transit. Whether you’re ordering from a metro city or a smaller town, WellMeds strives to make specialty medicines accessible whenever you need them.
          </p>
        </div>

        {/* Section 6 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Why Thousands Trust WellMeds
          </h2>
          <p className="wellmeds-healthcare-para">
            Patients, caregivers, hospitals, doctors, and healthcare professionals choose WellMeds because we prioritize quality, transparency, and patient care.
          </p>
          <p className="wellmeds-healthcare-para font-semibold">
            Why Choose WellMeds?
          </p>

          <ul className="wellmeds-healthcare-list cols-2">
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Genuine & Authentic Medicines</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Wide Range of Specialty Pharmaceuticals</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Oncology & Transplant Medicine Experts</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Trusted Pharmacy Support</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Competitive Pricing</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Secure Ordering Process</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Fast Delivery Across India</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Reliable Customer Assistance</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Professional Prescription Handling</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Dedicated Patient-Centric Service</span>
            </li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Complete Healthcare Under One Roof
          </h2>
          <p className="wellmeds-healthcare-para">
            Along with prescription medicines, WellMeds also offers a growing range of healthcare essentials, including:
          </p>

          <ul className="wellmeds-healthcare-list cols-2">
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/surgical" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Surgical Supplies
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Medical Equipment</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Diabetes Care Products</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Blood Pressure Monitors</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Orthopedic Supports</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Nutrition & Protein Supplements</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Vitamins & Minerals</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Personal Care Products</span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>
                <Link to="/wellness" className="hover:text-[#038076] hover:underline transition-colors font-medium">
                  Wellness Products
                </Link>
              </span>
            </li>
            <li className="wellmeds-healthcare-list-item">
              <CheckIcon />
              <span>Home Healthcare Essentials</span>
            </li>
          </ul>

          <p className="wellmeds-healthcare-para pt-2">
            Our mission is to become your trusted destination for complete healthcare needs.
          </p>
        </div>

        {/* Section 8 */}
        <div className="wellmeds-healthcare-block">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Making Healthcare Accessible
          </h2>
          <p className="wellmeds-healthcare-para">
            Serious illnesses require timely treatment, and access to medicines should never become an obstacle. At WellMeds, we continuously work towards improving medicine availability, simplifying the ordering process, and delivering dependable pharmaceutical services to patients across India.
          </p>
          <p className="wellmeds-healthcare-para">
            From the first prescription to every refill, our commitment remains the same—providing authentic medicines with professional care and reliable support.
          </p>
        </div>

        {/* Section 9 */}
        <div className="wellmeds-healthcare-block pb-2">
          <h2 className="wellmeds-healthcare-sec-heading tracking-tight">
            Your Health. Our Responsibility.
          </h2>
          <p className="wellmeds-healthcare-para">
            At WellMeds, every order represents a patient waiting for treatment, a family seeking hope, and a promise to deliver healthcare with integrity.
          </p>
          <p className="wellmeds-healthcare-para">
            Whether you are searching for life-saving medicines, specialty pharmaceuticals, chronic disease treatments, or everyday healthcare products, WellMeds is committed to providing a safe, trusted, and seamless pharmacy experience.
          </p>
          <p className="wellmeds-healthcare-para font-medium">
            Choose WellMeds for genuine medicines, expert support, and dependable healthcare—because your health deserves the very best.
          </p>
        </div>

      </div>
    </section>
  );
};

export default HealthcareInformation;
