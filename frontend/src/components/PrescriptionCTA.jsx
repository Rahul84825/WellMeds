import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  UploadCloud, 
  ClipboardCheck, 
  Truck, 
  MessageCircle,
  ShieldCheck 
} from "lucide-react";

const PrescriptionCTA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (user) {
      navigate("/upload-prescription");
    } else {
      navigate("/login", { state: { from: "/upload-prescription" } });
    }
  };

  const steps = [
    {
      number: 1,
      title: "Upload Your Prescription",
      description: "Upload through the website or share it via WhatsApp.",
      icon: UploadCloud,
      iconColor: "text-[#004782]",
      borderColor: "border-[#004782]",
    },
    {
      number: 2,
      title: "Pharmacist Verification",
      description: "Our licensed pharmacist reviews your prescription and confirms medicine availability.",
      icon: ClipboardCheck,
      iconColor: "text-[#086b53]",
      borderColor: "border-[#086b53]",
    },
    {
      number: 3,
      title: "Fast Delivery",
      description: "Medicines are packed securely and delivered quickly across Pune and throughout India.",
      icon: Truck,
      iconColor: "text-[#004782]",
      borderColor: "border-[#004782]",
    },
  ];

  return (
    <section className="py-5 md:py-20 bg-slate-50/50 dark:bg-zinc-950/40 border-y border-slate-100 dark:border-zinc-900 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Pattern Grid */}
      <div className="absolute inset-0 medical-pattern opacity-30 pointer-events-none"></div>
 
      <div className="home-section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center">
          
          {/* Left Column: 35% Width Marketing */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4">
              <span className="inline-block bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
                How It Works
              </span>
              <h2 className="font-headline-md text-[22px] md:text-headline-md text-on-surface lg:text-headline-lg lg:font-headline-lg">
                Get Your Medicines in 3 Simple Steps
              </h2>
              <p className="font-body-md text-[13px] md:text-sm lg:text-base text-on-surface-variant dark:text-surface-variant max-w-xl">
                Upload your doctor's prescription and let WellMeds handle the rest with fast verification and reliable delivery.
              </p>
            </div>
 
            {/* Vertical Timeline */}
            <div className="relative pl-lg border-l-2 border-dashed border-outline-variant/60 dark:border-outline/40 space-y-lg ml-md pt-xs pb-xs">
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.number} className="relative group">
                    {/* Badge centered on the line */}
                    <div className={`absolute -left-[38px] top-0 w-9 h-9 bg-surface-container-lowest dark:bg-inverse-surface border-2 ${step.borderColor} rounded-full flex items-center justify-center ${step.iconColor} shadow-xs transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
 
                    <div className="pl-sm">
                      <h4 className="font-headline-sm text-[16px] md:text-headline-sm text-on-surface mb-xs flex items-center gap-sm">
                        <span>{step.title}</span>
                        <span className="hidden sm:inline-flex bg-surface-container dark:bg-surface-container-high text-on-surface-variant/70 dark:text-surface-variant/70 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          Step {step.number}
                        </span>
                      </h4>
                      <p className="font-body-sm text-[13px] md:text-sm text-on-surface-variant dark:text-surface-variant leading-relaxed max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
 
          {/* Right Column: Upload Card */}
          <div className="lg:col-span-5 h-full flex flex-col justify-center">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/40 dark:border-outline/20 p-4 md:p-xl rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden flex flex-col items-center justify-center text-center">
              
              {/* Decorative radial background glow */}
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#004782]/5 dark:bg-[#004782]/10 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Upload Icon Badge */}
              <div className="w-11 h-11 md:w-16 md:h-16 bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] rounded-full flex items-center justify-center mb-md md:mb-lg shadow-inner group-hover:scale-105 transition-transform duration-300">
                <UploadCloud className="w-6 h-6 md:w-8 md:h-8" />
              </div>
 
              {/* Title & Info */}
              <h3 className="font-headline-sm text-[18px] md:text-headline-sm text-on-surface mb-sm">
                Upload Your Prescription
              </h3>
              
              <div className="space-y-xs mb-md md:mb-lg">
                <p className="font-body-sm text-[13px] md:text-sm text-on-surface-variant dark:text-surface-variant">
                  Supported Formats: <strong className="text-on-surface dark:text-white font-semibold">PNG, JPG, JPEG, PDF</strong>
                </p>
                <p className="text-[12px] text-on-surface-variant/70 dark:text-surface-variant/70">
                  Maximum file size: <span className="font-medium">10 MB</span>
                </p>
              </div>
 
              {/* Action Button */}
              <button
                onClick={handleUploadClick}
                className="w-full bg-[#004782] hover:bg-[#003866] text-white h-[45px] md:py-sm px-lg rounded-xl font-label-md text-label-md font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#004782] focus:ring-offset-2 flex items-center justify-center gap-xs cursor-pointer select-none"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Upload Prescription</span>
              </button>
 
              {/* Help & WhatsApp Link */}
              <div className="mt-md pt-md border-t border-outline-variant/20 dark:border-outline/10 w-full text-center">
                <p className="text-[12px] text-on-surface-variant/70 dark:text-surface-variant/70 mb-xs">
                  Need Help?
                </p>
                <a
                  href="https://wa.me/917420909445"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-xs text-[#086b53] dark:text-[#84d6b9] font-bold text-sm hover:underline hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Us: +91 74209 09445</span>
                </a>
              </div>
 
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PrescriptionCTA;
