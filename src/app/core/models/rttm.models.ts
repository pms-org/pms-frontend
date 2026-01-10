export interface MetricCard {
  title: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface PipelineStage {
  name: string;
  count: number;
  latencyMs: number;
  successRate: number;
}

export interface Alert {
  message: string;
  severity: 'HIGH' | 'MEDIUM';
  timeAgo: string;
}

export interface DLQResponse {
  total: number;
  byStage: { [stage: string]: number };
}

export interface DLQError {
  stage: string;
  count: number;
}

export interface RttmData {
  metrics: MetricCard[];
  pipeline: PipelineStage[];
  tpsTrend: number[];
  latencyMetrics: { label: string; value: number }[];
  kafkaLag: { partition: string; lag: number }[];
  dlq: {
    total: number;
    lastError: string;
    errors: DLQError[];
  };
  alerts: Alert[];
}
