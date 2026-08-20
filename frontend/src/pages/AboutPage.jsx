import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import heroBannerImg from "../assets/about/wellmeds-hero-banner.jpg";

const AboutPage = () => {
  const containerRef = useRef(null);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ];

  // IntersectionObserver for gentle opacity fade-in
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const revealEls = container.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => io.observe(el));
      return () => io.disconnect();
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);

  return (
    <div className="about-page" ref={containerRef}>
      {/* ── SEO METADATA ── */}
      <SEO
        title="About Wellmeds — Our Vision, Our Story"
        description="Wellmeds began as a single pharmacy counter in Pune. This is our vision, our aim, and the founder's story behind it."
        canonical="/about"
        breadcrumbs={breadcrumbs}
      />

      <style>{`
        .about-page {
          --bg: #FFFFFF;
          --ink: #172B26;
          --green: #0F3B34;
          --teal: #157A6D;
          --teal-light: #4FC2A8;
          --mustard: #B08D3E;
          --rust: #C1703A;
          --cream: #F3EEE0;
          --pastel: #E7F1EC;
          --line: rgba(15,59,52,0.14);

          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
          text-align: left;
        }

        .about-page * {
          box-sizing: border-box;
        }

        .about-page h1,
        .about-page h2,
        .about-page h3,
        .about-page .display {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
          line-height: 1.1;
          color: var(--green);
          letter-spacing: -0.02em;
        }

        .about-page .wrap {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .about-page .eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--teal);
          display: inline-block;
          margin-bottom: 18px;
        }

        /* Gentle opacity-only fade */
        .about-page .reveal {
          opacity: 0;
          transition: opacity 1.4s ease-out;
        }
        .about-page .reveal.is-visible {
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-page .reveal {
            opacity: 1;
            transition: none;
          }
        }

        /* ---------- Hero ---------- */
        .about-page .hero {
          padding: 80px 0 70px;
        }
        .about-page .hero__tag {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }
        .about-page .stamp {
          background: var(--rust);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 11px;
          border-radius: 7px;
          transform: rotate(-4deg);
        }
        .about-page .hero__tag span {
          font-size: 13px;
          color: rgba(23,43,38,0.55);
          font-weight: 500;
        }
        .about-page .hero h1 {
          font-weight: 800;
          font-size: clamp(34px, 5.4vw, 60px);
          max-width: 18ch;
          margin-bottom: 24px;
        }
        .about-page .hero h1 em {
          font-style: normal;
          font-weight: 800;
          color: var(--teal);
        }
        .about-page .hero p.lede {
          font-size: 19px;
          max-width: 54ch;
          color: rgba(23,43,38,0.75);
          font-weight: 400;
          line-height: 1.6;
        }
        .about-page .hero__banner {
          margin-top: 48px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(15, 59, 52, 0.08);
          border: 1px solid var(--line);
        }
        .about-page .hero__banner img {
          width: 100%;
          height: auto;
          max-height: 520px;
          object-fit: cover;
          display: block;
        }

        /* ---------- Our Promise (full-bleed banner) ---------- */
        .about-page .promise {
          background: var(--green);
          padding: 90px 0;
          text-align: center;
        }
        .about-page .promise .eyebrow {
          color: var(--mustard);
          margin-bottom: 22px;
        }
        .about-page .promise h2 {
          color: var(--cream);
          font-weight: 800;
          font-size: clamp(28px, 4.4vw, 44px);
          max-width: 22ch;
          margin: 0 auto 26px;
        }
        .about-page .promise h2 em {
          font-style: normal;
          color: var(--teal-light);
        }
        .about-page .promise p {
          color: rgba(243,238,224,0.72);
          font-size: 16.5px;
          max-width: 56ch;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* ---------- Vision & Aim ---------- */
        .about-page .vision {
          padding: 20px 0 110px;
          border-top: 1px solid var(--line);
        }
        .about-page .vision__head {
          margin: 80px 0 48px;
          max-width: 60ch;
        }
        .about-page .vision__head h2 {
          font-size: clamp(28px, 3.6vw, 38px);
        }
        .about-page .vision__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .about-page .vision__col {
          padding: 0 40px 0 0;
        }
        .about-page .vision__col + .vision__col {
          padding: 0 0 0 40px;
          border-left: 1px solid var(--line);
        }
        .about-page .vision__col h3 {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mustard);
          margin-bottom: 18px;
        }
        .about-page .vision__col p {
          font-size: 18px;
          color: var(--ink);
          line-height: 1.6;
        }

        /* ---------- Founder's Story ---------- */
        .about-page .story {
          padding: 20px 0 110px;
          border-top: 1px solid var(--line);
        }
        .about-page .story__inner {
          display: grid;
          grid-template-columns: 0.4fr 0.6fr;
          gap: 60px;
          align-items: start;
          margin-top: 80px;
        }
        .about-page .story__dropcap {
          font-family: 'Inter', sans-serif;
          font-size: 170px;
          font-weight: 900;
          line-height: 0.72;
          color: var(--teal);
          opacity: 0.13;
          user-select: none;
        }
        .about-page .story h2 {
          font-size: clamp(28px, 3.6vw, 38px);
          margin-bottom: 24px;
        }
        .about-page .story p {
          margin-bottom: 19px;
          max-width: 60ch;
          color: rgba(23,43,38,0.85);
          font-size: 17px;
        }
        .about-page .story__signoff {
          margin-top: 28px;
          padding-top: 22px;
          border-top: 1px solid var(--line);
          font-style: italic;
          font-weight: 500;
          font-size: 19px;
          color: var(--green);
        }
        .about-page .story__signoff span {
          display: block;
          font-style: normal;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--mustard);
          margin-top: 8px;
        }

        /* ---------- Our Journey (timeline) ---------- */
        .about-page .journey {
          padding: 20px 0 130px;
          border-top: 1px solid var(--line);
        }
        .about-page .journey__head {
          margin: 80px 0 72px;
          max-width: 64ch;
        }
        .about-page .journey__head h2 {
          font-size: clamp(28px, 3.8vw, 40px);
          color: var(--green);
          line-height: 1.15;
        }

        .about-page .timeline {
          position: relative;
        }
        .about-page .timeline__line {
          position: absolute;
          top: 29px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--line), var(--teal), var(--line));
          opacity: 0.35;
          z-index: 0;
        }
        .about-page .timeline__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
        }
        .about-page .timeline__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 8px;
        }

        /* State ring: solid teal = done, filled green = now, dashed mustard = next */
        .about-page .timeline__circle {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 2px solid var(--teal);
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .about-page .timeline__circle svg {
          width: 24px;
          height: 24px;
          color: var(--teal);
        }
        .about-page .timeline__item--active .timeline__circle {
          background: var(--green);
          border-color: var(--green);
          box-shadow: 0 0 0 6px rgba(15,59,52,0.08);
        }
        .about-page .timeline__item--active .timeline__circle svg {
          color: #fff;
        }
        .about-page .timeline__item--future .timeline__circle {
          border-style: dashed;
          border-color: var(--mustard);
        }
        .about-page .timeline__item--future .timeline__circle svg {
          color: var(--mustard);
        }

        .about-page .timeline__year {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--teal);
          opacity: 0.75;
          margin-bottom: 10px;
        }
        .about-page .timeline__item--active .timeline__year {
          color: var(--teal);
          opacity: 1;
        }
        .about-page .timeline__item--future .timeline__year {
          color: var(--mustard);
          opacity: 1;
          font-style: italic;
        }
        .about-page .timeline__title {
          font-weight: 800;
          font-size: 17px;
          color: var(--green);
          margin-bottom: 10px;
        }
        .about-page .timeline__desc {
          font-size: 14px;
          color: rgba(23,43,38,0.72);
          line-height: 1.6;
          max-width: 23ch;
        }

        /* ---------- What we want to do (pastel section) ---------- */
        .about-page .plans {
          background: var(--pastel);
          padding: 90px 0 110px;
        }
        .about-page .plans__head {
          max-width: 56ch;
        }
        .about-page .plans__head h2 {
          font-size: clamp(28px, 3.6vw, 38px);
          margin-bottom: 16px;
        }
        .about-page .plans__head p {
          color: rgba(23,43,38,0.68);
          font-size: 17px;
        }

        .about-page .plans__list {
          margin-top: 36px;
        }
        .about-page .plans__item {
          display: grid;
          grid-template-columns: 22px 1fr;
          gap: 24px;
          align-items: baseline;
          padding: 32px 0;
          border-top: 1px solid rgba(15,59,52,0.15);
        }
        .about-page .plans__item:last-child {
          border-bottom: 1px solid rgba(15,59,52,0.15);
        }
        .about-page .plans__mark {
          width: 10px;
          height: 10px;
          background: var(--rust);
          margin-top: 10px;
        }
        .about-page .plans__item p {
          font-size: 19px;
          font-weight: 600;
          color: var(--green);
          max-width: 60ch;
          line-height: 1.4;
        }

        /* ==========================================================
           RESPONSIVE REFINEMENTS
           ========================================================== */
        @media (max-width: 760px) {
          .about-page .story__inner {
            grid-template-columns: 1fr;
          }
          .about-page .story__dropcap {
            display: none;
          }
          .about-page .timeline__line {
            display: none;
          }
          .about-page .timeline__grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .about-page .timeline__item {
            flex-direction: row;
            align-items: flex-start;
            text-align: left;
            gap: 20px;
            padding: 0 0 40px;
            position: relative;
          }
          .about-page .timeline__item::before {
            content: "";
            position: absolute;
            left: 28px;
            top: 58px;
            bottom: 8px;
            width: 1px;
            background: var(--line);
          }
          .about-page .timeline__item:last-child::before {
            display: none;
          }
          .about-page .timeline__item:last-child {
            padding-bottom: 0;
          }
          .about-page .timeline__circle {
            margin-bottom: 0;
          }
          .about-page .timeline__desc {
            max-width: none;
          }
        }

        @media (max-width: 720px) {
          .about-page .vision__grid {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .about-page .vision__col {
            padding: 0 !important;
          }
          .about-page .vision__col + .vision__col {
            border-left: none;
            border-top: 1px solid var(--line);
            padding-top: 36px !important;
          }
        }

        @media (max-width: 640px) {
          .about-page .wrap {
            padding: 0 22px;
          }
          .about-page .hero {
            padding: 50px 0 40px;
          }
          .about-page .hero__tag {
            flex-wrap: wrap;
            row-gap: 8px;
            margin-bottom: 20px;
          }
          .about-page .hero h1 {
            font-size: clamp(28px, 8vw, 36px);
            margin-bottom: 16px;
            letter-spacing: -0.01em;
          }
          .about-page .hero p.lede {
            font-size: 16px;
            line-height: 1.6;
          }
          .about-page .hero__banner {
            margin-top: 32px;
            border-radius: 16px;
          }
          .about-page .promise {
            padding: 56px 0;
          }
          .about-page .promise h2 {
            font-size: clamp(23px, 7.5vw, 29px);
            line-height: 1.28;
            max-width: 20ch;
          }
          .about-page .promise p {
            font-size: 15px;
            margin-top: 2px;
          }
          .about-page .vision {
            padding: 12px 0 64px;
          }
          .about-page .vision__head {
            margin: 56px 0 32px;
          }
          .about-page .vision__head h2 {
            font-size: clamp(24px, 7.5vw, 30px);
          }
          .about-page .vision__col h3 {
            font-size: 12px;
          }
          .about-page .vision__col p {
            font-size: 16px;
            line-height: 1.6;
          }
          .about-page .story {
            padding: 12px 0 64px;
          }
          .about-page .story__inner {
            margin-top: 44px;
            gap: 26px;
          }
          .about-page .story h2 {
            font-size: clamp(24px, 7.5vw, 30px);
          }
          .about-page .story p {
            font-size: 15.5px;
          }
          .about-page .story__signoff {
            font-size: 17px;
          }
          .about-page .journey {
            padding: 12px 0 72px;
          }
          .about-page .journey__head {
            margin: 56px 0 40px;
          }
          .about-page .journey__head h2 {
            font-size: clamp(23px, 7.5vw, 29px);
            line-height: 1.22;
          }
          .about-page .timeline__title {
            font-size: 16.5px;
          }
          .about-page .plans {
            padding: 56px 0 60px;
          }
          .about-page .plans__head h2 {
            font-size: clamp(24px, 7.5vw, 30px);
          }
          .about-page .plans__head p {
            font-size: 15.5px;
          }
          .about-page .plans__item {
            padding: 24px 0;
          }
          .about-page .plans__item p {
            font-size: 17px;
          }
        }

        @media (max-width: 380px) {
          .about-page .wrap {
            padding: 0 18px;
          }
          .about-page .hero h1 {
            font-size: clamp(26px, 9vw, 32px);
          }
          .about-page .promise h2 {
            font-size: clamp(21px, 8.5vw, 25px);
          }
          .about-page .journey__head h2,
          .about-page .vision__head h2,
          .about-page .story h2,
          .about-page .plans__head h2 {
            font-size: clamp(21px, 8.5vw, 25px);
          }
          .about-page .timeline__circle {
            width: 50px;
            height: 50px;
          }
          .about-page .timeline__circle svg {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>

      <main>
        {/* ── HERO ── */}
        <section className="hero">
          <div className="wrap reveal">
            <div className="hero__tag">
              <div className="stamp">Est. 2023</div>
              <span>Pune, Maharashtra</span>
            </div>
            <h1>
              We started with <em>one shop.</em> We're building something bigger.
            </h1>
            <p className="lede">
              Wellmeds began as a single pharmacy counter in Pune — and grew into a mission: make genuine, affordable medicine easy to reach, for anyone who needs it.
            </p>

            {/* Hero Image Banner */}
            <div className="hero__banner">
              <img
                src={heroBannerImg}
                alt="WellMeds Pharmacy Storefront — Baner, Pune"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* ── VISION & AIM ── */}
        <section className="vision" id="vision">
          <div className="wrap">
            <div className="vision__head reveal">
              <p className="eyebrow">Vision &amp; aim</p>
              <h2>What we're working toward.</h2>
            </div>
            <div className="vision__grid reveal">
              <div className="vision__col">
                <h3>Our vision</h3>
                <p>
                  To be the most trusted name in genuine, affordable healthcare — starting with our own neighbourhood in Pune, and reaching every Indian household that needs us.
                </p>
              </div>
              <div className="vision__col">
                <h3>Our aim</h3>
                <p>
                  To make sure no one has to choose between a medicine that's real and a medicine they can afford — and to get it to them faster and more simply than anywhere else can.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER'S STORY ── */}
        <section className="story" id="story">
          <div className="wrap story__inner">
            <div className="story__dropcap reveal">W</div>
            <div className="reveal">
              <p className="eyebrow">Founder's story</p>
              <h2>It started with one counter in Pune.</h2>
              <p>
                In 2023, Ramesh Choudhary opened Wellmeds with a simple aim: give people in his neighbourhood faster, more reliable access to the medicines they depend on — the ones that can't wait for tomorrow.
              </p>
              <p>
                What began as one shop grew into a steady stream of regulars who trusted us with their prescriptions, their emergencies, and their family's health. That trust is still the foundation everything else is built on.
              </p>
              <p>
                Wellmeds' offline store remains our home base — the counter where all of this started, and where we still know most of our customers by name.
              </p>
              <div className="story__signoff">
                "We built Wellmeds around the customers we already knew — now we're building it for the ones we haven't met yet."
                <span>Ramesh Choudhary, Founder</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── OUR PROMISE ── */}
        <section className="promise">
          <div className="wrap reveal">
            <p className="eyebrow">Our promise</p>
            <h2>
              No one should have to <em>delay treatment</em> because a medicine was hard to find.
            </h2>
            <p>
              That's the standard we hold every order to — from the first prescription upload to the moment it's safely in your hands.
            </p>
          </div>
        </section>

        {/* ── OUR JOURNEY ── */}
        <section className="journey" id="journey">
          <div className="wrap">
            <div className="journey__head reveal">
              <p className="eyebrow">Our journey</p>
              <h2>From a Neighbourhood Shop to a Digital Pharmacy</h2>
            </div>

            <div className="timeline reveal">
              <div className="timeline__line"></div>
              <div className="timeline__grid">
                {/* 2023 */}
                <div className="timeline__item">
                  <div className="timeline__circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 9.5 5 4h14l1 5.5" />
                      <path d="M4 9.5v10h16v-10" />
                      <path d="M9.5 19.5v-6h5v6" />
                    </svg>
                  </div>
                  <p className="timeline__year">2023</p>
                  <h3 className="timeline__title">The Shop Opens</h3>
                  <p className="timeline__desc">
                    Wellmeds starts as a neighbourhood pharmacy in Baner, Pune — built around one goal: better service.
                  </p>
                </div>

                {/* 2024-25 */}
                <div className="timeline__item">
                  <div className="timeline__circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10.5" cy="10.5" r="6.5" />
                      <path d="m20 20-4.8-4.8" />
                    </svg>
                  </div>
                  <p className="timeline__year">2024&ndash;25</p>
                  <h3 className="timeline__title">The Gap Becomes Clear</h3>
                  <p className="timeline__desc">
                    Patients keep arriving having searched multiple pharmacies for specialty medicines nobody stocked.
                  </p>
                </div>

                {/* 2026 Active */}
                <div className="timeline__item timeline__item--active">
                  <div className="timeline__circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                    </svg>
                  </div>
                  <p className="timeline__year">2026</p>
                  <h3 className="timeline__title">Going Digital</h3>
                  <p className="timeline__desc">
                    Wellmeds launches online — genuine sourcing, cold-chain delivery, and pharmacist care for all of Pune and beyond.
                  </p>
                </div>

                {/* What's Next Future */}
                <div className="timeline__item timeline__item--future">
                  <div className="timeline__circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17 9 11l4 4 8-9" />
                      <path d="M15 6h6v6" />
                    </svg>
                  </div>
                  <p className="timeline__year">What's Next</p>
                  <h3 className="timeline__title">Pan-India Reach</h3>
                  <p className="timeline__desc">
                    Extending 3-day delivery and the same verified-medicine promise to more cities across India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT WE WANT TO DO ── */}
        <section className="plans" id="plans">
          <div className="wrap">
            <div className="plans__head reveal">
              <p className="eyebrow">What we want to do</p>
              <h2>Where Wellmeds goes from here.</h2>
              <p>
                Our offline store stays home base. Everything we build next is about extending that same care further.
              </p>
            </div>
            <div className="plans__list reveal">
              <div className="plans__item">
                <div className="plans__mark"></div>
                <p>
                  Reach families beyond Pune, without losing the personal trust of a neighbourhood pharmacy.
                </p>
              </div>
              <div className="plans__item">
                <div className="plans__mark"></div>
                <p>
                  Keep growing our medicine information library, so knowledge is never the barrier to good care.
                </p>
              </div>
              <div className="plans__item">
                <div className="plans__mark"></div>
                <p>
                  Stay a pharmacist-led business at heart — never just a marketplace — no matter how large we grow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
