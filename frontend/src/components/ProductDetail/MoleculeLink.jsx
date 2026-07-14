import React from "react";
import { Link } from "react-router-dom";

const MoleculeLink = ({ molecule }) => {
  if (!molecule) return null;
  return (
    <Link
      to={`/molecule/${molecule.slug}`}
      className="text-[#111827] dark:text-zinc-100 hover:text-blue-400 dark:hover:text-blue-400 font-normal underline hover:no-underline transition-all duration-200 cursor-pointer text-xs"
    >
      {molecule.name}
    </Link>
  );
};

export default MoleculeLink;
