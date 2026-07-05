import React from "react";
import { Link } from "react-router-dom";

const MoleculeLink = ({ molecule }) => {
  if (!molecule) return null;
  return (
    <Link
      to={`/molecule/${molecule.slug}`}
      className="inline-flex items-center gap-1.5 px-md py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/20 text-[#038076] dark:text-[#84d6b9] text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer select-none"
    >
      <span className="material-symbols-outlined text-[13px] leading-none">science</span>
      {molecule.name}
    </Link>
  );
};

export default MoleculeLink;
