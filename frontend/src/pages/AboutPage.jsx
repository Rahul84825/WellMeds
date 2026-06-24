import React from "react";

const About = () => {
  const leaders = [
    {
      name: "Dr. Elizabeth Vance, MD",
      role: "Chief Medical Officer",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU-rD_DhET0glsjROzxuQOJ4UxSl3ZjzvTW6BCqF1Ytd-zayFaACSoBY12NKbSSijmeu85DOsRPGhyS0iGfGxYQEJcpP-vuC6A-H-Z5GYd-bWI64XWotJEqpBd6RBoR21x86HFUIIyvuIdDiYUwgICJfkUp1kco9-ANVkx19Tdp7dj_ydLhxULRmMYlUjicJF7hS1gPiQLpHyEGcexE1asXkDGFlCcZczPRo__wmeDOQ7Y_gpO3HIHr-74NcuBa6Xe579pjnf_dq8I",
      desc: "Cardiologist with 15+ years of clinical practice, supervising health quality and prescription review controls."
    },
    {
      name: "Marcus Thorne, PharmD",
      role: "Lead Pharmacist",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxr9a9BZ7uZjIAgex8m212dSE8oZZ378LNCU61QGXYiMVdzxsG7VdTm6Rz8IBPUYF4QDggHvH8mNE7T9JJ0xU_KRS4rGJxd9ALF41K5WOQ10jORgrxEpdL3g31lRZ4h2wVw90K3eRqgUj81M3CfGZnZlmZx_lCfqZQh1zFwQZ0QwJ_RJ4cgnuvYFdI8p6wrgDYk84FNG-ScPB4TEzFpsIfMP-cwpsWk1DJbBYIUlwY0vXhXeVslg_ayRcNmBJONkn4LOG2mm31M7fi",
      desc: "Specialized in pharmacology and clinical interactions, managing our state-of-the-art dispensing systems."
    },
    {
      name: "Sanjay Patel",
      role: "Operations Director",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAphcqGx1fnNXyk5p_UtWhj_s54is7crJPOrdv-bdBBDjM48or3uFwhmUtrwjHBoS1DJjVoeJj_btREqdZQp1g8-Lbe94PGnvb7v74XRz3Aj5VYtoE_hsUmosd8fMoqz5B1wG6_vhc7YoDq_71RmIVWjnpqzvXZxpze9TDRNG6lLxdGwlgGCRNwIxQYR4QhQxhmRZ83e3lkrp7IfWJFRkhX5qm5siC1CD7CtiAQWlmqIP7k1wOHo5Oz12fYUEJvrtFjgc-vKMHgMYEb",
      desc: "Directs logistics operations to guarantee safe transit and temperature-controlled next-day delivery."
    }
  ];

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] space-y-xxl text-left">
      {/* Intro Header */}
      <section className="text-center space-y-md max-w-3xl mx-auto py-xl">
        <span className="bg-primary-container text-on-primary-container border border-primary/20 px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
          Our Story
        </span>
        <h1 className="font-headline-lg text-headline-lg md:text-5xl font-bold text-primary dark:text-primary-fixed-dim leading-tight">
          Redefining Healthcare Delivery
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant leading-relaxed">
          MediShop is a licensed pharmacy provider merging professional medical security with direct e-commerce simplicity.
        </p>
      </section>

      {/* Grid: Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-lg">
        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm">
          <div className="w-12 h-12 bg-primary-fixed text-primary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">visibility</span>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Our Vision</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed">
            To create a frictionless, secure, and compassionate digital clinical channel where consumers can consult, order prescription therapies, and manage their health essentials without administrative burden.
          </p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm">
          <div className="w-12 h-12 bg-secondary-fixed text-secondary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">assignment</span>
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Our Mission</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed">
            We operate with clinical precision, verifying all patient prescription documents securely, selecting FDA-approved manufacturers directly, and providing prompt clinical assistance to support treatment compliance.
          </p>
        </div>
      </section>

      {/* Stats Board */}
      <section className="bg-surface-container dark:bg-surface-container-high rounded-2xl p-xl grid grid-cols-2 md:grid-cols-4 gap-lg text-center transition-colors duration-300">
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed-dim">100k+</h3>
          <p className="text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mt-xs">
            Customers Served
          </p>
        </div>
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed-dim">120+</h3>
          <p className="text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mt-xs">
            Licensed Pharmacists
          </p>
        </div>
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed-dim">99.8%</h3>
          <p className="text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mt-xs">
            On-time Delivery
          </p>
        </div>
        <div>
          <h3 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed-dim">10M+</h3>
          <p className="text-label-sm text-on-surface-variant dark:text-surface-variant uppercase tracking-wider mt-xs">
            Doses Distributed
          </p>
        </div>
      </section>

      {/* Experts section */}
      <section className="space-y-xl">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface text-center">Meet Our Medical Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {leaders.map((leader, index) => (
            <div key={index} className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm flex flex-col items-center text-center space-y-md">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/25 bg-surface-container">
                <img alt={leader.name} className="w-full h-full object-cover" src={leader.image} />
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">{leader.name}</h4>
                <p className="text-body-sm text-secondary font-medium mt-xs">{leader.role}</p>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
                {leader.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
