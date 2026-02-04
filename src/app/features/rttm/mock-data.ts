import { RttmData } from '../../core/models/rttm.models';

export const MOCK_RTTM_DATA: RttmData = {
  metrics: [
    { title: 'Current TPS', value: 1247, unit: 'tx/s', status: 'healthy' },
    { title: 'Peak TPS', value: 1580, unit: 'tx/s', status: 'healthy' },
    { title: 'Avg Latency', value: 45, unit: 'ms', status: 'healthy' },
    { title: 'DLQ Count', value: 23, unit: 'errors', status: 'warning' },
    { title: 'Kafka Lag', value: 1250, unit: 'msgs', status: 'warning' }
  ],
  pipeline: [
    { name: 'RECEIVED', count: 12450, latencyMs: 12, successRate: 99.8 },
    { name: 'VALIDATED', count: 12430, latencyMs: 18, successRate: 99.5 },
    { name: 'ENRICHED', count: 12380, latencyMs: 35, successRate: 99.2 },
    { name: 'COMMITTED', count: 12350, latencyMs: 28, successRate: 99.7 },

  ],
  tpsTrend: [1100, 1150, 1200, 1180, 1220, 1250, 1240, 1260, 1247],
  latencyMetrics: [
    { label: 'Avg', value: 45 },
    { label: 'P95', value: 78 },
    { label: 'P99', value: 125 }
  ],
  kafkaLag: [
    { partition: 'P0', lag: 320 },
    { partition: 'P1', lag: 280 },
    { partition: 'P2', lag: 350 },
    { partition: 'P3', lag: 300 }
  ],
  dlq: {
    total: 23,
    lastError: '2 mins ago',
    errors: [
      { stage: 'VALIDATED', count: 8 },
      { stage: 'ENRICHED', count: 12 },
      { stage: 'COMMITTED', count: 3 }
    ]
  },
  alerts: [
    { message: 'Kafka lag exceeding threshold on P2', severity: 'HIGH', timeAgo: '3m ago' },
    { message: 'DLQ count increased by 15%', severity: 'MEDIUM', timeAgo: '5m ago' },
    { message: 'Latency spike detected in ENRICHED stage', severity: 'HIGH', timeAgo: '8m ago' },
    { message: 'Partition rebalance completed', severity: 'MEDIUM', timeAgo: '12m ago' }
  ]
};
