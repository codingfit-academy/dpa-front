import React from 'react';

interface DiseaseButtonProps {
  label: string;
  onClick: () => void;
}

const DiseaseButton: React.FC<DiseaseButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full aspect-[3/2] flex items-center justify-center rounded-xl bg-white shadow-md hover:bg-teal-50 hover:scale-105 transition-all duration-200 text-lg font-bold text-slate-800 border border-slate-100"
    >
      {label}
    </button>
  );
};

export default DiseaseButton;
