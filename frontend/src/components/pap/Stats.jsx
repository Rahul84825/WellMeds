import React from "react";

const stats = [
  { value: "1,500+", label: "Patients Assisted", desc: "Accessing subsidized treatments" },
  { value: "15+", label: "Pharma Brand Programs", desc: "Active manufacturer collaborations" },
  { value: "₹2.5 Cr+", label: "Direct Patient Savings", desc: "Through approved subsidies" },
  { value: "100%", label: "Free Advocacy Service", desc: "No facilitation or file charges" }
];

const Stats = () => {
  return (
    <section className="py-12 px-6 sm:px-12 lg:px-24 bg-gradient-to-br from-[#086b53] to-[#004782] text-white">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-lg text-center">
        {stats.map((stat, idx) => (
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
