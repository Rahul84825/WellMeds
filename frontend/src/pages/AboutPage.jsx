import React from "react";
import SEO from "../components/common/SEO";
import heroBannerImg from "../assets/about/wellmeds-hero-banner.jpg";
import ownerImg from "../assets/about/owner.png";

const AboutPage = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ];

  return (
    <div className="about-page">
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
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--teal);
          display: inline-block;
          margin-bottom: 18px;
        }

        /* ---------- Full-Width Edge-to-Edge Hero Banner ---------- */
        .about-page .hero {
          width: 100%;
          background: #EEF5F1;
          padding: 0;
          margin: 0 0 32px 0;
          overflow: hidden;
          line-height: 0;
          border-bottom: 1px solid var(--line);
        }
        .about-page .hero__container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          line-height: 0;
        }
        .about-page .hero__image {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 7.94;
          max-height: 485px;
          display: block;
          object-fit: cover;
          object-position: center;
        }

        /* ---------- Vision & Aim ---------- */
        .about-page .vision {
          padding: 40px 0 80px;
        }
        .about-page .vision__head {
          margin-bottom: 48px;
        }
        .about-page .vision__head h2 {
          font-size: clamp(28px, 4vw, 42px);
          max-width: 20ch;
        }
        .about-page .vision__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        .about-page .vision__col {
          padding-right: 20px;
        }
        .about-page .vision__col + .vision__col {
          border-left: 1px solid var(--line);
          padding-left: 48px;
          padding-right: 0;
        }
        .about-page .vision__col h3 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--teal);
          margin-bottom: 16px;
        }
        .about-page .vision__col p {
          font-size: 18px;
          line-height: 1.65;
          color: var(--green);
          font-weight: 500;
        }

        /* ---------- Founder's Story ---------- */
        .about-page .story {
          padding: 60px 0 90px;
          border-top: 1px solid var(--line);
        }
        .about-page .story .wrap {
          max-width: 1140px;
        }
        .about-page .story__inner {
          display: grid;
          grid-template-columns: minmax(380px, 480px) 1fr;
          gap: 48px;
          align-items: center;
        }
        .about-page .story__image-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(15, 59, 52, 0.08);
          border: 1px solid var(--line);
          background: #f1f5f3;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .about-page .story__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }
        .about-page .story__content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .about-page .story h2 {
          font-size: clamp(26px, 3.4vw, 38px);
          margin-bottom: 20px;
        }
        .about-page .story p {
          font-size: 16.5px;
          color: rgba(23,43,38,0.78);
          margin-bottom: 16px;
          line-height: 1.65;
        }
        .about-page .story__signoff {
          margin-top: 18px;
          padding: 20px 24px;
          background: #f8faf9;
          border-left: 3px solid var(--teal);
          border-radius: 0 12px 12px 0;
          font-style: italic;
          font-size: 16.5px;
          color: var(--green);
          line-height: 1.5;
        }
        .about-page .story__signoff span {
          display: block;
          margin-top: 8px;
          font-style: normal;
          font-weight: 700;
          font-size: 12.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--teal);
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
          font-size: 17px;
          max-width: 50ch;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* ---------- Our Journey ---------- */
        .about-page .journey {
          padding: 40px 0 100px;
        }
        .about-page .journey__head {
          margin: 60px 0 72px;
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
        @media (max-width: 860px) {
          .about-page .story__inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .about-page .story__image-wrap {
            height: 420px;
            max-width: 100%;
          }
        }

        @media (max-width: 760px) {
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
            margin: 32px 0 32px;
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
            margin: 32px 0 40px;
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
        {/* ── FULL WIDTH HERO BANNER ── */}
        <section className="hero">
          <div className="hero__container">
            <img
              src={heroBannerImg}
              alt="WellMeds — We started with one shop. We're building something bigger."
              loading="eager"
              className="hero__image"
            />
          </div>
        </section>

        {/* ── VISION & AIM ── */}
        <section className="vision" id="vision">
          <div className="wrap">
            <div className="vision__head">
              <p className="eyebrow">Vision &amp; aim</p>
              <h2>What we're working toward.</h2>
            </div>
            <div className="vision__grid">
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
            <div className="story__image-wrap">
              <img
                src={ownerImg}
                alt="Ramesh Choudhary — Founder of WellMeds"
                loading="lazy"
                className="story__image"
              />
            </div>
            <div className="story__content">
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
          <div className="wrap">
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
            <div className="journey__head">
              <p className="eyebrow">Our journey</p>
              <h2>From a Neighbourhood Shop to a Digital Pharmacy</h2>
            </div>

            <div className="timeline">
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
            <div className="plans__head">
              <p className="eyebrow">What we want to do</p>
              <h2>Where Wellmeds goes from here.</h2>
              <p>
                Our offline store stays home base. Everything we build next is about extending that same care further.
              </p>
            </div>
            <div className="plans__list">
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
