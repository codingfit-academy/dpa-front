// DPA API 클라이언트
// 백엔드(FastAPI)의 /v1/* 엔드포인트와 통신.
// 베이스 URL은 VITE_API_URL 환경변수로 주입 (없으면 localhost:8000).

const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? 'https://dpa-api.codingfit.kr';

export type DiseaseId = 'covid' | 'cold' | 'flu' | 'pneumonia' | 'allergy';

export interface ExposureWindowed {
  pm25: number;
  pm10: number;
  o3: number;
  so2: number;
  asianDust: number;
  ni: number;
  covid_pressure: number;
}

export interface ExposureDaily extends ExposureWindowed {
  date: string;
}

export interface ExposureResponse {
  regionCode: string;
  asOf: string;
  daily: ExposureDaily[];
  windowed: ExposureWindowed;
  source: string;
}

export interface CIBlock {
  rr: { p2_5: number; p50: number; p97_5: number };
  p: { p2_5: number; p50: number; p97_5: number };
}

export interface StratumResult {
  age_group: string;
  sex: 'male' | 'female';
  rr: number;
  probability: number;
  ci: CIBlock;
  lambda0_per_day: number;
}

export interface RiskResponse {
  disease: DiseaseId;
  region_code: string;
  target_date: string;
  horizon_days: number;
  exposures: ExposureWindowed;
  summary: {
    child: { probability: number; rr: number };
    adult: { probability: number; rr: number };
  };
  results: StratumResult[];
}

export interface TimeseriesPoint {
  date: string;
  iso: string;
  child: number;
  adult: number;
  rr: number;
}

export interface TimeseriesResponse {
  disease: DiseaseId;
  region_code: string;
  points: TimeseriesPoint[];
}

export interface ActionsResponse {
  disease: DiseaseId;
  child: string[];
  adult: string[];
  common: string[];
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const dpaApi = {
  baseUrl: API_BASE_URL,

  health: () => fetch(`${API_BASE_URL}/health`).then(jsonOrThrow<{ status: string; db: string }>),

  config: () =>
    fetch(`${API_BASE_URL}/config`).then(
      jsonOrThrow<{ naverMapsClientId: string; kakaoMapsAppKey: string }>,
    ),

  exposure: (regionCode = '11', historyDays = 7) => {
    const qs = new URLSearchParams({
      region_code: regionCode,
      history_days: String(historyDays),
    });
    return fetch(`${API_BASE_URL}/v1/exposure?${qs}`).then(
      jsonOrThrow<ExposureResponse>,
    );
  },

  computeRisk: (params: {
    disease: DiseaseId;
    regionCode?: string;
    horizonDays?: number;
    mcSamples?: number;
  }) =>
    fetch(`${API_BASE_URL}/v1/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease: params.disease,
        region_code: params.regionCode ?? '11',
        horizon_days: params.horizonDays ?? 1,
        mc_samples: params.mcSamples ?? 1500,
      }),
    }).then(jsonOrThrow<RiskResponse>),

  riskTimeseries: (disease: DiseaseId, regionCode = '11', days = 5) => {
    const qs = new URLSearchParams({
      disease,
      region_code: regionCode,
      days: String(days),
    });
    return fetch(`${API_BASE_URL}/v1/risk/timeseries?${qs}`).then(
      jsonOrThrow<TimeseriesResponse>,
    );
  },

  riskActions: (disease: DiseaseId) => {
    const qs = new URLSearchParams({ disease });
    return fetch(`${API_BASE_URL}/v1/risk/actions?${qs}`).then(
      jsonOrThrow<ActionsResponse>,
    );
  },
};

export default dpaApi;
