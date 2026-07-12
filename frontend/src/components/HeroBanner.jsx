import React from "react";
import heroImage from "../assets/banners/hero.png";
import { UniversalSearch } from "./common/UniversalSearch";

const Hero = () => {
  return (
    <section
      style={{
        backgroundImage:    `url(${heroImage})`,
        backgroundSize:     "cover",
        backgroundPosition: "center top",
        backgroundRepeat:   "no-repeat",
      }}
      className="relative w-full overflow-hidden h-[310px] md:h-[335px]
                 flex flex-col items-center justify-center select-none"
    >
      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[900px] flex-col
                      items-center justify-center px-6 text-center gap-4">

        {/* Heading */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-white
                         sm:text-[32px] lg:text-[41px]">
            More Than a Pharmacy.
          </h1>
          <p className="text-[19px] font-semibold tracking-tight text-[#038076]
                        sm:text-[24px] lg:text-[31px]">
            Your Partner in Better Health.
          </p>
        </div>

        {/* Search bar — reusable UniversalSearch component */}
        <div className="mt-2 w-full max-w-[650px]">
          <UniversalSearch variant="hero" />
        </div>

      </div>
    </section>
  );
};

export default Hero;