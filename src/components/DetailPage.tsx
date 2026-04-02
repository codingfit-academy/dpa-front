import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DetailPage: React.FC = () => {
  const { disease } = useParams<{ disease: string}>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans p-6 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-teal-800">
        {disease} 상세 분석
      </h1>
      <p className="text-xl text-slate-600 mb-12 max-w-lg">
        선택하신 질병의 감염 확률 및 주변 확산 동향 데이터를 분석하여 이 화면에 제공될 예정입니다.
      </p>
      
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-12 flex flex-col items-center justify-center gap-4">
         <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Analysis Placeholder</span>
         <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin"></div>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="px-8 py-4 bg-teal-600 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-0.5 transition-all duration-200"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default DetailPage;
