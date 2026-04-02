import React from 'react';
import { useNavigate } from 'react-router-dom';
import DiseaseButton from './DiseaseButton';
import ImagePlaceholder from './ImagePlaceholder';

const diseases = [
  { id: 'covid', name: '코로나' },
  { id: 'cold', name: '감기' },
  { id: 'flu', name: '독감' },
  { id: 'pneumonia', name: '폐렴' },
  { id: 'allergy', name: '알레르기' }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDiseaseClick = (diseaseId: string) => {
    navigate(`/detail/${diseaseId}`);
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-200 font-sans overflow-hidden">
      {/* Left Section (40%) */}
      <div className="w-[40%] flex flex-col justify-center px-16 xl:px-24 py-12 z-10">
        <h1 className="text-4xl xl:text-5xl font-extrabold mb-12 text-slate-900 leading-tight tracking-tight">
          확인하고싶은<br />질병을 고르세요.
        </h1>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          {diseases.map((disease) => (
            <DiseaseButton
              key={disease.id}
              label={disease.name}
              onClick={() => handleDiseaseClick(disease.id)}
            />
          ))}
        </div>
      </div>

      {/* Right Section (60%) */}
      <div className="w-[60%] p-6 xl:p-12">
        <div className="w-full h-full animate-fade-in">
          <ImagePlaceholder />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
