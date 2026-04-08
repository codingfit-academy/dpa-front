import React from 'react';
import { useNavigate } from 'react-router-dom';
import DiseaseButton from './DiseaseButton';
import FallingPetals from './FallingPetals';
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
    <div className="relative min-h-screen w-full flex flex-col-reverse md:flex-row bg-slate-800 font-sans overflow-y-auto md:overflow-hidden">
      <FallingPetals />
      {/* Left Section (40% on Desktop, Bottom on Mobile) */}
      <div className="w-full md:w-[40%] flex flex-col justify-center px-6 sm:px-12 md:px-16 xl:px-24 py-12 md:py-12 z-10 min-h-[50vh] md:min-h-screen pb-20 md:pb-12">
        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold mb-8 md:mb-12 text-white leading-tight tracking-tight text-center md:text-left drop-shadow-sm">
          확인하고싶은<br />질병을 고르세요.
        </h1>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm mx-auto md:mx-0 px-2 sm:px-0">
          {diseases.map((disease) => (
            <DiseaseButton
              key={disease.id}
              label={disease.name}
              onClick={() => handleDiseaseClick(disease.id)}
            />
          ))}
        </div>
      </div>

      {/* Right Section (60% on Desktop, Top on Mobile) */}
      <div className="w-full md:w-[60%] p-4 sm:p-6 md:p-8 xl:p-12 min-h-[45vh] md:h-screen flex items-center justify-center pt-8 md:pt-12">
        <div className="w-full h-full min-h-[30vh] sm:min-h-[40vh] md:min-h-0 animate-fade-in rounded-3xl overflow-hidden shadow-2xl relative">
          <ImagePlaceholder />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
