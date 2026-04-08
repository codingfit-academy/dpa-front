import React from 'react';

interface DiseaseButtonProps {
  label: string;
  onClick: () => void;
}

const DiseaseButton: React.FC<DiseaseButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="burst-btn group relative w-full aspect-[3/2] overflow-hidden rounded-xl bg-white shadow-md hover:bg-pink-50 hover:scale-105 transition-all duration-200 text-lg font-bold text-slate-800 border border-slate-100"
    >
      <span className="burst-petal petal-1" />
      <span className="burst-petal petal-2" />
      <span className="burst-petal petal-3" />
      <span className="burst-petal petal-4" />
      <span className="burst-petal petal-5" />
      <span className="burst-petal petal-6" />
      <span className="relative z-10">{label}</span>
    </button>
  );
};

export default DiseaseButton;
