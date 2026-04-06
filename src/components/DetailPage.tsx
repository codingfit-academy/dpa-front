import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, CheckCircle2, Cloud, Thermometer, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

const childData = [
  { date: '4/1', probability: 20 },
  { date: '4/2', probability: 25 },
  { date: '4/3', probability: 30 },
  { date: '4/4', probability: 32 },
  { date: '4/5', probability: 35 },
];

const childActions = [
  "마스크 착용", "손 씻기", "사람 많은 곳 피하기", "증상 있으면 병원 방문"
];

const adultData = [
  { date: '4/1', probability: 40 },
  { date: '4/2', probability: 45 },
  { date: '4/3', probability: 48 },
  { date: '4/4', probability: 50 },
  { date: '4/5', probability: 55 },
];

const adultActions = [
  "충분한 수면", "비타민 섭취", "외출 후 손 씻기", "증상 시 병원 방문"
];

const commonActions = [
  "미세먼지 마스크 착용", "물 많이 마시기", "실내 공기청정기 사용", "외출 시간 줄이기"
];

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 200, damping: 20 } 
  }
};

const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  hover: { y: -6, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", transition: { type: "spring", stiffness: 400, damping: 17 } }
};

const pulseGlow = {
  initial: { opacity: 0.5, scale: 1 },
  animate: { 
    opacity: [0.3, 0.6, 0.3], 
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

const DetailPage: React.FC = () => {
  const { disease } = useParams<{ disease: string}>();
  const navigate = useNavigate();

  // Disease mapping object for pretty names if needed
  const displayName = disease === 'covid' ? '코로나' :
                      disease === 'cold' ? '감기' :
                      disease === 'flu' ? '독감' :
                      disease === 'pneumonia' ? '폐렴' :
                      disease === 'allergy' ? '알레르기' : disease;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden"
    >
      {/* Navigation */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 px-6 py-4 fixed top-0 z-50 flex items-center"
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-bold tracking-tight">돌아가기</span>
        </button>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto pt-24 px-4 sm:px-6"
      >
        
        {/* 1. Page Header */}
        <motion.div variants={headerVariants} className="mb-10 px-2 lg:px-0 mt-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-3">
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
              className="text-teal-600 inline-block"
            >
              {displayName}
            </motion.span> 
            상세 분석
          </h1>
          <motion.hr 
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 border-t-[3px] border-slate-200/60 rounded-full origin-left" 
          />
        </motion.div>

        <div className="space-y-10">

          {/* 2. Children Section */}
          <motion.section variants={sectionVariants} className="bg-sky-50/70 border border-sky-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="mb-6 px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-sky-900 mb-2">어린이</h2>
              <p className="text-sky-700/80 font-medium">12세 미만 대상 분석 결과입니다.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Probability */}
              <motion.div 
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-sky-50 flex flex-col justify-center items-center h-full min-h-[200px]"
              >
                <span className="text-slate-400 font-bold mb-3 uppercase tracking-wider text-sm">현재 걸릴 확률</span>
                <div className="text-6xl font-black text-sky-500 drop-shadow-sm flex items-baseline">
                  35<span className="text-3xl text-sky-400 ml-1">%</span>
                </div>
              </motion.div>
              
              {/* Chart */}
              <motion.div 
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-sky-50 lg:col-span-2 relative overflow-hidden"
              >
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider pl-1">날짜별 확률 추이</h3>
                <div className="h-48 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={childData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} tickLine={false} axisLine={false} dy={10} />
                      <YAxis tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} dx={-10} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        formatter={(value: number) => [`${value}%`, '확률']}
                      />
                      <Line type="monotone" dataKey="probability" stroke="#0ea5e9" strokeWidth={4} dot={{r: 5, fill: "#fff", strokeWidth: 3, stroke: "#0ea5e9"}} activeDot={{r: 8, fill: "#0ea5e9", stroke: "#d0f1ff", strokeWidth: 4}} animationDuration={2000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              {/* Action Items */}
              <motion.div 
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-sky-50 lg:col-span-3"
              >
                <h3 className="text-lg font-black text-sky-900 mb-5">그래서 어떻게 할지</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {childActions.map((action, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.03, backgroundColor: "rgb(224,242,254)" }}
                      className="flex items-center gap-3 bg-sky-50/50 p-4 rounded-2xl border border-sky-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="text-sky-500 shrink-0" size={22} />
                      <span className="font-bold text-slate-700">{action}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* 3. Adult Section */}
          <motion.section variants={sectionVariants} className="bg-amber-50/70 border border-amber-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="mb-6 px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-900 mb-2">어른</h2>
              <p className="text-amber-700/80 font-medium">12세 이상 성인 대상 분석 결과입니다.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Probability */}
              <motion.div 
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-amber-50 flex flex-col justify-center items-center h-full min-h-[200px]"
              >
                <span className="text-slate-400 font-bold mb-3 uppercase tracking-wider text-sm">현재 걸릴 확률</span>
                <div className="text-6xl font-black text-amber-500 drop-shadow-sm flex items-baseline">
                  55<span className="text-3xl text-amber-400 ml-1">%</span>
                </div>
              </motion.div>
              
              {/* Chart */}
              <motion.div 
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-amber-50 lg:col-span-2 relative overflow-hidden"
              >
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider pl-1">날짜별 확률 추이</h3>
                <div className="h-48 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={adultData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} tickLine={false} axisLine={false} dy={10} />
                      <YAxis tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 600}} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} dx={-10} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        formatter={(value: number) => [`${value}%`, '확률']}
                      />
                      <Line type="monotone" dataKey="probability" stroke="#f59e0b" strokeWidth={4} dot={{r: 5, fill: "#fff", strokeWidth: 3, stroke: "#f59e0b"}} activeDot={{r: 8, fill: "#f59e0b", stroke: "#fef3c7", strokeWidth: 4}} animationDuration={2000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              {/* Action Items */}
              <motion.div 
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-amber-50 lg:col-span-3"
              >
                <h3 className="text-lg font-black text-amber-900 mb-5">그래서 어떻게 할지</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {adultActions.map((action, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.03, backgroundColor: "rgb(254,243,199)" }}
                      className="flex items-center gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="text-amber-500 shrink-0" size={22} />
                      <span className="font-bold text-slate-700">{action}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* 4. Common Data Section */}
          <motion.section variants={sectionVariants} className="bg-slate-100 border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
            
            {/* Ad Banner */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between mb-10 shadow-lg cursor-pointer relative overflow-hidden"
            >
              <motion.div 
                variants={pulseGlow}
                initial="initial"
                animate="animate"
                className="absolute top-0 right-0 w-64 h-64 bg-slate-500/30 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl flex-shrink-0 pointer-events-none"
              ></motion.div>
              <div className="relative z-10 w-full text-center sm:text-left">
                <span className="bg-teal-500 text-xs font-black px-3 py-1.5 rounded-md text-white tracking-widest mb-4 inline-block shadow-sm">AD</span>
                <h4 className="text-xl sm:text-2xl font-black mb-2 text-white">우리 가족 건강을 위한 필수가전</h4>
                <p className="text-slate-300 text-sm sm:text-base font-medium">최신 공기청정기로 미세먼지와 바이러스를 한 번에 해결하세요.</p>
              </div>
              <div className="mt-6 sm:mt-0 relative z-10 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold whitespace-nowrap backdrop-blur-sm transition-colors border border-white/10 w-full sm:w-auto text-center">
                알아보기 &rarr;
              </div>
            </motion.div>

            <div className="mb-6 px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">오늘의 공통 데이터</h2>
              <p className="text-slate-500 font-medium">질병 예방을 위해 꼭 확인해야 할 환경 정보입니다.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Weather Info Cards */}
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-start sm:justify-center lg:justify-start gap-4 border border-slate-100">
                <div className="w-14 h-14 rounded-[1rem] bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Cloud size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">날씨</div>
                  <div className="text-xl font-black text-slate-800">맑음</div>
                </div>
              </motion.div>
              
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-start sm:justify-center lg:justify-start gap-4 border border-slate-100">
                <div className="w-14 h-14 rounded-[1rem] bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Thermometer size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">온도</div>
                  <div className="text-xl font-black text-slate-800">18°C</div>
                </div>
              </motion.div>
              
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-start sm:justify-center lg:justify-start gap-4 border border-slate-100">
                <div className="w-14 h-14 rounded-[1rem] bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Wind size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">미세먼지</div>
                  <div className="text-xl font-black text-red-500">나쁨</div>
                </div>
              </motion.div>
            </div>

            {/* Action Items */}
            <motion.div variants={cardHover} initial="rest" whileHover="hover" className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-slate-50">
              <h3 className="text-lg font-black text-slate-800 mb-5">그래서 어떻게 할지</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {commonActions.map((action, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.03, backgroundColor: "rgb(241,245,249)" }}
                    className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="text-slate-400 shrink-0" size={22} />
                    <span className="font-bold text-slate-700">{action}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </motion.section>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetailPage;
