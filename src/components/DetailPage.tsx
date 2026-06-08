import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, CheckCircle2, Cloud, Thermometer, Wind, AlertCircle, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import dpaApi from '../services/api';
import type {
  DiseaseId,
  RiskResponse,
  TimeseriesResponse,
  ActionsResponse,
  ExposureResponse,
} from '../services/api';

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
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
};

const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  hover: { y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', transition: { type: 'spring', stiffness: 400, damping: 17 } }
};

const pulseGlow = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
};

const KNOWN_DISEASES: DiseaseId[] = ['covid', 'cold', 'flu', 'pneumonia', 'allergy'];

const displayNameOf = (d: string | undefined): string => {
  switch (d) {
    case 'covid': return '코로나';
    case 'cold': return '감기';
    case 'flu': return '독감';
    case 'pneumonia': return '폐렴';
    case 'allergy': return '알레르기';
    default: return d ?? '';
  }
};

// PM10 µg/m³ → 등급
const pmGrade = (pm10: number): { label: string; color: string } => {
  if (pm10 <= 30) return { label: '좋음', color: 'text-blue-500' };
  if (pm10 <= 80) return { label: '보통', color: 'text-emerald-500' };
  if (pm10 <= 150) return { label: '나쁨', color: 'text-orange-500' };
  return { label: '매우나쁨', color: 'text-red-600' };
};

// 행동 수칙 → "왜 효과가 있는지" 과학적 근거.
// 백엔드가 내려주는 문자열은 질병마다 조금씩 달라서, 정확히 일치시키는 대신
// 핵심 키워드로 매칭한다. 더 구체적인 항목을 위에 두어 먼저 잡히게 한다.
const ACTION_NOTES: { keys: string[]; note: string }[] = [
  { keys: ['KF94', 'KF80', '미세먼지 마스크'], note: 'KF94·KF80 마스크는 0.4µm 시험입자를 각각 94%·80% 걸러냅니다. 비말 속 바이러스와 PM2.5를 물리적으로 막아 들이마시는 양을 줄여요.' },
  { keys: ['마스크'], note: '마스크는 비말과 미세먼지를 물리적으로 거릅니다. 들이마시고 내뱉는 입자 수를 함께 줄여 전파를 막아요.' },
  { keys: ['손 씻기', '손씻기'], note: '비누의 계면활성제가 바이러스의 지질막(외피)을 부숩니다. 흐르는 물에 30초 이상 씻으면 손에 묻은 병원체가 99% 이상 제거돼요.' },
  { keys: ['사람 많은 곳'], note: '밀폐·밀집 공간일수록 공기 속 비말 농도가 올라갑니다. 거리를 둘수록 흡입하는 바이러스 양과 감염 위험이 줄어요.' },
  { keys: ['신속검사', '항바이러스제'], note: '항바이러스제는 증상이 나타난 뒤 48시간 안에 써야 효과가 가장 큽니다. 빠른 검사로 치료 시점을 놓치지 않을 수 있어요.' },
  { keys: ['병원', '진료'], note: '조기 진단·치료는 폐렴 같은 합병증으로의 진행을 막습니다. 증상이 빠르게 나빠지면 바로 의료기관을 찾는 게 안전해요.' },
  { keys: ['환기'], note: '실내 공기를 바깥과 바꾸면 떠 있는 비말과 이산화탄소 농도가 떨어집니다. 하루 3회·10분이면 바이러스 농도를 크게 낮춰요.' },
  { keys: ['백신', '예방접종'], note: '백신은 항원을 미리 학습시켜 면역 기억세포를 만듭니다. 실제 감염 때 항체가 빠르게 작동해 발병·중증화 위험을 낮춰요.' },
  { keys: ['공기청정기'], note: 'HEPA 필터는 0.3µm 입자를 99.97% 붙잡습니다. PM2.5와 공기 중 알레르겐·바이러스 입자를 줄여 호흡기 부담을 덜어요.' },
  { keys: ['수면', '푹 쉬기', '휴식'], note: '잠자는 동안 면역세포(T세포)와 사이토카인이 활발히 만들어집니다. 수면이 부족하면 감염 위험이 여러 배 높아져요.' },
  { keys: ['수분', '물 자주'], note: '수분은 기도 점막을 촉촉하게 유지합니다. 점액의 섬모 운동이 활발해져 병원체를 밖으로 밀어내는 1차 방어가 잘 돌아가요.' },
  { keys: ['체온'], note: '발열은 면역 반응의 신호이자 합병증의 조기 경보입니다. 38℃ 이상이 이어지면 진료가 필요해요.' },
  { keys: ['따뜻하게'], note: '체온이 내려가면 코·기도 점막의 혈류와 면역세포 활동이 둔해집니다. 따뜻하게 유지하면 바이러스 증식 억제에 유리해요.' },
  { keys: ['비타민'], note: '비타민 C·D는 면역세포 기능과 점막 방어를 돕습니다. 특히 비타민 D가 부족하면 호흡기 감염 위험이 올라가요.' },
  { keys: ['습도', '건조'], note: '습도 40~60%에서 기도 점막이 마르지 않고 공기 속 비말도 빨리 가라앉습니다. 너무 건조하면 바이러스 생존 시간이 길어져요.' },
  { keys: ['기침 예절'], note: '기침·재채기 비말은 멀게는 수 미터까지 퍼집니다. 옷소매로 가리면 손 오염과 비말 확산을 동시에 막아요.' },
  { keys: ['식사', '영양'], note: '단백질·아연·비타민은 항체와 면역세포를 만드는 재료입니다. 영양이 불균형하면 면역 반응이 떨어져요.' },
  { keys: ['꽃가루'], note: '꽃가루는 알레르기 항원(IgE)을 자극해 히스타민을 분비시킵니다. 노출이 줄면 코·눈의 염증 반응도 약해져요.' },
  { keys: ['샤워'], note: '머리카락과 피부에 붙은 꽃가루·미세먼지를 씻어냅니다. 실내로 들어온 알레르겐이 다시 퍼지는 걸 막아요.' },
  { keys: ['침구'], note: '침구 속 집먼지진드기와 꽃가루는 알레르기의 주요 원인입니다. 55℃ 이상 물로 세탁하면 진드기를 사멸시켜요.' },
  { keys: ['항히스타민', '처방약', '정시 복용'], note: '항히스타민제는 히스타민 수용체를 막아 증상을 누릅니다. 증상이 나기 전에 미리 복용해야 예방 효과가 커요.' },
  { keys: ['황사 예보', '예보 확인'], note: '농도가 높은 날 외출을 조절하면 흡입량을 줄일 수 있습니다. 예보에 따른 회피가 가장 확실한 노출 차단이에요.' },
  { keys: ['알레르겐 차단'], note: '원인 물질(꽃가루·진드기·곰팡이)과의 접촉을 줄이는 것이 알레르기 관리의 기본입니다. 노출이 없으면 과민반응도 일어나지 않아요.' },
  { keys: ['외출'], note: '오염물질 농도가 높은 시간대 노출을 줄입니다. 흡입 총량을 낮춰 호흡기·심혈관 부담을 덜어요.' },
  { keys: ['금연'], note: '흡연은 폐의 섬모를 마비시키고 폐포를 손상시켜 폐렴 위험을 크게 높입니다. 끊으면 수 주 안에 섬모 기능이 회복돼요.' },
  { keys: ['기저질환', '면역력'], note: '당뇨·만성폐질환 등은 면역을 약화시켜 폐렴 중증화 위험을 키웁니다. 기저질환을 잘 관리하면 합병증 위험이 낮아져요.' },
];

const explainAction = (action: string): string | null =>
  ACTION_NOTES.find(n => n.keys.some(k => action.includes(k)))?.note ?? null;

// 대기·미세먼지 단위 안내 (뷰에서 그대로 렌더)
const UNIT_NOTES: { term: string; desc: string }[] = [
  { term: 'PM2.5 / PM10', desc: 'PM은 Particulate Matter(입자상 물질). 뒤 숫자는 입자 지름(µm)으로, PM2.5는 머리카락 1/20 굵기라 폐포 깊숙이 침투해요.' },
  { term: 'µg/m³', desc: '마이크로그램 퍼 세제곱미터. 공기 1m³ 속 먼지 무게(1g의 100만분의 1)로, 숫자가 클수록 공기가 탁해요.' },
  { term: 'O₃ (오존)', desc: '산소 원자 3개로 이뤄진 기체. 지표면 오존은 햇빛과 배기가스가 반응해 생기며 호흡기를 자극하는 오염물질이에요.' },
  { term: 'ppb', desc: 'parts per billion, 10억분율. 공기 분자 10억 개 중 해당 기체 분자 수로, ppb가 클수록 농도가 높아요.' },
];

const DetailPage: React.FC = () => {
  const { disease } = useParams<{ disease: string }>();
  const navigate = useNavigate();

  const diseaseId = useMemo<DiseaseId | null>(() => {
    if (!disease) return null;
    return (KNOWN_DISEASES as string[]).includes(disease) ? (disease as DiseaseId) : null;
  }, [disease]);

  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesResponse | null>(null);
  const [actions, setActions] = useState<ActionsResponse | null>(null);
  const [exposure, setExposure] = useState<ExposureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!diseaseId) {
      setError(`알 수 없는 질병: ${disease}`);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      dpaApi.computeRisk({ disease: diseaseId, regionCode: '11', horizonDays: 1 }),
      dpaApi.riskTimeseries(diseaseId, '11', 5),
      dpaApi.riskActions(diseaseId),
      dpaApi.exposure('11', 7),
    ])
      .then(([r, t, a, e]) => {
        if (cancelled) return;
        setRisk(r);
        setTimeseries(t);
        setActions(a);
        setExposure(e);
      })
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [diseaseId, disease]);

  const childPct = risk ? (risk.summary.child.probability * 100).toFixed(2) : '--';
  const adultPct = risk ? (risk.summary.adult.probability * 100).toFixed(2) : '--';

  const childChartData = useMemo(
    () => timeseries?.points.map(p => ({ date: p.date, probability: p.child })) ?? [],
    [timeseries],
  );
  const adultChartData = useMemo(
    () => timeseries?.points.map(p => ({ date: p.date, probability: p.adult })) ?? [],
    [timeseries],
  );

  // 데이터 값에 맞춰 Y축 범위를 동적으로 좁히고, 위·아래 여백을 살짝 둔다.
  const getYDomain = (data: { probability: number }[]): [number, number] => {
    if (!data.length) return [0, 100];
    const values = data.map(d => d.probability);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range === 0 ? Math.max(0.1, Math.abs(max) * 0.05) : range * 0.25;
    const lo = Math.max(0, min - padding);
    const hi = max + padding;
    return [Math.floor(lo * 100) / 100, Math.ceil(hi * 100) / 100];
  };

  const childYDomain = useMemo(() => getYDomain(childChartData), [childChartData]);
  const adultYDomain = useMemo(() => getYDomain(adultChartData), [adultChartData]);

  const pm10 = exposure?.windowed.pm10 ?? 0;
  const pm25 = exposure?.windowed.pm25 ?? 0;
  const pmStatus = pmGrade(pm10);
  const o3 = exposure?.windowed.o3 ?? 0;

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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto pt-24 px-4 sm:px-6"
      >
        {/* Header */}
        <motion.div variants={headerVariants} className="mb-10 px-2 lg:px-0 mt-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-baseline gap-3">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
              className="text-teal-600 inline-block"
            >
              {displayNameOf(disease)}
            </motion.span>
            상세 분석
          </h1>
          <motion.hr
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 border-t-[3px] border-slate-200/60 rounded-full origin-left"
          />
          {risk && (
            <p className="mt-3 text-sm text-slate-500 font-medium">
              기준일 {risk.target_date} · 지역 {risk.region_code} ·
              7일 평균 PM2.5 {pm25} µg/m³, O₃ {o3} ppb
              {risk.exposures.asianDust > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  황사 발생일
                </span>
              )}
            </p>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-bold">데이터를 가져올 수 없습니다.</div>
              <div className="text-sm mt-1">{error}</div>
              <div className="text-xs mt-1 text-rose-500">API 서버({dpaApi.baseUrl})가 켜져 있는지 확인하세요.</div>
            </div>
          </div>
        )}

        {loading && !error && (
          <div className="mb-6 flex items-center gap-3 text-slate-500 font-medium">
            <Loader2 className="animate-spin" size={20} /> 위험 확률을 계산하는 중…
          </div>
        )}

        <div className="space-y-10">
          {/* Children Section */}
          <motion.section variants={sectionVariants} className="bg-sky-50/70 border border-sky-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="mb-6 px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-sky-900 mb-2">어린이</h2>
              <p className="text-sky-700/80 font-medium">12세 미만 (0–4 + 5–17세 평균) 분석 결과입니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Probability */}
              <motion.div
                variants={cardHover} initial="rest" whileHover="hover"
                className="burst-btn bg-white rounded-[1.5rem] p-6 shadow-sm border border-sky-50 flex flex-col justify-center items-center h-full min-h-[200px]"
              >
                <span className="text-slate-400 font-bold mb-3 uppercase tracking-wider text-sm">현재 걸릴 확률</span>
                <div className="text-6xl font-black text-sky-500 drop-shadow-sm flex items-baseline">
                  {childPct}<span className="text-3xl text-sky-400 ml-1">%</span>
                </div>
                {risk && (
                  <div className="mt-2 text-xs text-slate-400 font-medium">
                    RR {risk.summary.child.rr.toFixed(2)}×
                  </div>
                )}
              </motion.div>

              {/* Chart */}
              <motion.div
                variants={cardHover} initial="rest" whileHover="hover"
                className="burst-btn bg-white rounded-[1.5rem] p-6 shadow-sm border border-sky-50 lg:col-span-2 relative overflow-hidden"
              >
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider pl-1">날짜별 확률 추이 (%)</h3>
                <div className="h-48 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={childChartData} margin={{ top: 5, right: 20, bottom: 5, left: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v.toFixed(2)}%`} domain={childYDomain} allowDecimals width={60} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, '확률']}
                      />
                      <Line type="monotone" dataKey="probability" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#0ea5e9' }} activeDot={{ r: 8, fill: '#0ea5e9', stroke: '#d0f1ff', strokeWidth: 4 }} animationDuration={1200} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(actions?.child ?? []).map((action, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgb(224,242,254)' }}
                      className="burst-btn flex items-start gap-3 bg-sky-50/50 p-4 rounded-2xl border border-sky-100 transition-colors cursor-pointer relative"
                    >
                      <CheckCircle2 className="text-sky-500 shrink-0 mt-0.5" size={22} />
                      <div className="min-w-0">
                        <span className="block font-bold text-slate-700 leading-snug">{action}</span>
                        {explainAction(action) && (
                          <span className="mt-1.5 block text-[13px] text-slate-500 font-medium leading-relaxed">
                            {explainAction(action)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Adult Section */}
          <motion.section variants={sectionVariants} className="bg-amber-50/70 border border-amber-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="mb-6 px-2">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-900 mb-2">어른</h2>
              <p className="text-amber-700/80 font-medium">12세 이상 (18–49, 50–64, 65+ 평균) 분석 결과입니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                variants={cardHover} initial="rest" whileHover="hover"
                className="burst-btn bg-white rounded-[1.5rem] p-6 shadow-sm border border-amber-50 flex flex-col justify-center items-center h-full min-h-[200px]"
              >
                <span className="text-slate-400 font-bold mb-3 uppercase tracking-wider text-sm">현재 걸릴 확률</span>
                <div className="text-6xl font-black text-amber-500 drop-shadow-sm flex items-baseline">
                  {adultPct}<span className="text-3xl text-amber-400 ml-1">%</span>
                </div>
                {risk && (
                  <div className="mt-2 text-xs text-slate-400 font-medium">
                    RR {risk.summary.adult.rr.toFixed(2)}×
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={cardHover} initial="rest" whileHover="hover"
                className="burst-btn bg-white rounded-[1.5rem] p-6 shadow-sm border border-amber-50 lg:col-span-2 relative overflow-hidden"
              >
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider pl-1">날짜별 확률 추이 (%)</h3>
                <div className="h-48 sm:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={adultChartData} margin={{ top: 5, right: 20, bottom: 5, left: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v.toFixed(2)}%`} domain={adultYDomain} allowDecimals width={60} />
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, '확률']}
                      />
                      <Line type="monotone" dataKey="probability" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#f59e0b' }} activeDot={{ r: 8, fill: '#f59e0b', stroke: '#fef3c7', strokeWidth: 4 }} animationDuration={1200} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                variants={cardHover} initial="rest" whileHover="hover"
                className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-amber-50 lg:col-span-3"
              >
                <h3 className="text-lg font-black text-amber-900 mb-5">그래서 어떻게 할지</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(actions?.adult ?? []).map((action, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgb(254,243,199)' }}
                      className="burst-btn flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 transition-colors cursor-pointer relative"
                    >
                      <CheckCircle2 className="text-amber-500 shrink-0 mt-0.5" size={22} />
                      <div className="min-w-0">
                        <span className="block font-bold text-slate-700 leading-snug">{action}</span>
                        {explainAction(action) && (
                          <span className="mt-1.5 block text-[13px] text-slate-500 font-medium leading-relaxed">
                            {explainAction(action)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Common Data Section */}
          <motion.section variants={sectionVariants} className="bg-slate-100 border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="burst-btn bg-slate-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between mb-10 shadow-lg cursor-pointer relative overflow-hidden"
            >
              <motion.div
                variants={pulseGlow}
                initial="initial"
                animate="animate"
                className="absolute top-0 right-0 w-64 h-64 bg-slate-500/30 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl flex-shrink-0 pointer-events-none"
              />
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
              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="burst-btn bg-white rounded-2xl p-5 shadow-sm flex items-center justify-start sm:justify-center lg:justify-start gap-4 border border-slate-100 relative">
                <div className="w-14 h-14 rounded-[1rem] bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Cloud size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PM2.5 (7일)</div>
                  <div className="text-xl font-black text-slate-800">{pm25 || '--'} µg/m³</div>
                </div>
              </motion.div>

              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="burst-btn bg-white rounded-2xl p-5 shadow-sm flex items-center justify-start sm:justify-center lg:justify-start gap-4 border border-slate-100 relative">
                <div className="w-14 h-14 rounded-[1rem] bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Thermometer size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">오존 O₃</div>
                  <div className="text-xl font-black text-slate-800">{o3 || '--'} ppb</div>
                </div>
              </motion.div>

              <motion.div variants={cardHover} initial="rest" whileHover="hover" className="burst-btn bg-white rounded-2xl p-5 shadow-sm flex items-center justify-start sm:justify-center lg:justify-start gap-4 border border-slate-100 relative">
                <div className="w-14 h-14 rounded-[1rem] bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Wind size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">미세먼지 PM10</div>
                  <div className={`text-xl font-black ${pmStatus.color}`}>{pmStatus.label}</div>
                </div>
              </motion.div>
            </div>

            {/* 단위 읽는 법 */}
            <motion.div variants={cardHover} initial="rest" whileHover="hover" className="burst-btn bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 relative">
              <h4 className="text-sm font-black text-slate-600 mb-4 flex items-center gap-2">
                <Info size={18} className="text-teal-500 shrink-0" />
                단위 읽는 법
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {UNIT_NOTES.map(u => (
                  <div key={u.term} className="flex flex-col">
                    <dt className="text-sm font-black text-slate-700">{u.term}</dt>
                    <dd className="mt-0.5 text-[13px] text-slate-500 font-medium leading-relaxed">{u.desc}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            <motion.div variants={cardHover} initial="rest" whileHover="hover" className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-slate-50">
              <h3 className="text-lg font-black text-slate-800 mb-5">그래서 어떻게 할지</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(actions?.common ?? []).map((action, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgb(241,245,249)' }}
                    className="burst-btn flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors cursor-pointer relative"
                  >
                    <CheckCircle2 className="text-slate-400 shrink-0 mt-0.5" size={22} />
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-700 leading-snug">{action}</span>
                      {explainAction(action) && (
                        <span className="mt-1.5 block text-[13px] text-slate-500 font-medium leading-relaxed">
                          {explainAction(action)}
                        </span>
                      )}
                    </div>
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
