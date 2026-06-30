import React from "react";

const defaultStats = [
  { value: "1,200+", label: "Patients Assisted", desc: "Accessing critical therapies" },
  { value: "45+", label: "Global Source Countries", desc: "Direct manufacturer channels" },
  { value: "600+", label: "Orphan & Cancer Medicines", desc: "Rare specialties catalog" },
  { value: "100%", label: "Authenticity Guarantee", desc: "Direct-from-source tracking" }
];

const Stats = ({ statsData }) => {
  const list = statsData || defaultStats;

  return (
    <section className="py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-br from-[#004782] to-[#086b53] text-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-lg text-center">
        {list.map((stat, idx) => (
          <div key={idx} className="space-y-xs">
            <p className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white to-white/85 bg-clip-text text-transparent">
              {stat.value}
            </p>
            <p className="text-xs font-black uppercase tracking-wider">{stat.label}</p>
            <p className="text-[10px] text-white/70 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
