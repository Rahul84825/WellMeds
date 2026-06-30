import React from "react";
import { Link } from "react-router-dom";
import { Shield, Brain, Heart, Syringe, Activity, Sparkles } from "lucide-react";

const defaultSpecialties = [
  { name: "Cancer Medicines", query: "Oncology", desc: "Chemotherapy & targeted therapies" },
  { name: "Rare Disease Medicines", query: "Orphan Drugs", desc: "Orphan drugs & genetic therapies" },
  { name: "Transplant Medicines", query: "Immunosuppressants", desc: "Anti-rejection immunosuppressants" },
  { name: "Neurology", query: "Neurology", desc: "Sclerosis & neurodegenerative care" },
  { name: "Immunology", query: "Immunology", desc: "Autoimmune & biological therapies" },
  { name: "Vaccines & Biologics", query: "Biologics", desc: "Specialty vaccines & monoclonal antibodies" }
];

const icons = [Shield, Sparkles, Heart, Brain, Activity, Syringe];

const SpecialtyCategories = ({ categoriesData }) => {
  const list = categoriesData || defaultSpecialties;

  return (
    <section className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900">
      <div className="max-w-[1440px] mx-auto text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100">
            Import Sourcing Specialties
          </h2>
          <p className="text-sm text-slate-550 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            We specialize in importing high-value, temperature-sensitive therapeutic drugs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {list.map((spec, idx) => {
            const IconComp = icons[idx % icons.length];
            return (
              <Link
                key={idx}
                to={`/products?category=${encodeURIComponent(spec.query)}`}
                className="bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-800/80 p-lg rounded-2xl flex items-start gap-md hover:border-[#004782] dark:hover:border-blue-700/80 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#038076]/5 border border-[#038076]/10 text-[#038076] dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <IconComp size={22} />
                </div>
                <div className="space-y-xs text-left min-w-0 flex-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-zinc-100 group-hover:text-[#004782] dark:group-hover:text-blue-400 transition-colors truncate">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-zinc-400 leading-normal font-medium line-clamp-2">
                    {spec.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecialtyCategories;
