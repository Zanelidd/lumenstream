export type MeasurementStatus = 'ok' | 'warning' | 'critical';

export interface Measurement {
  count: number;
  value: number;
  timestamp: number;
  status: MeasurementStatus;
}
