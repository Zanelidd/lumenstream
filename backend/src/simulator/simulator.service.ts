import { Injectable } from '@nestjs/common';
import { Measurement, MeasurementStatus } from '../measurement.interface';
import {
  distinctUntilChanged,
  filter,
  interval,
  map,
  Observable,
  share,
} from 'rxjs';

const CONFIG = {
  nominal: 100,
  warmupAmp: 3.5,
  warmupTau: 12,
  driftAmp: 0.6,
  driftPeriod: 45,
  noiseStd: 0.35,
  lower: 95,
  upper: 105,
  warn: 2,
} as const;

@Injectable()
export class SimulatorService {
  readonly measurements$: Observable<Measurement> = interval(1000).pipe(
    map(() => this.generateRaw()),
    map((m) => ({ ...m, status: this.evaluate(m.value) })),
    share(),
  );

  readonly alert$: Observable<Measurement> = this.measurements$.pipe(
    distinctUntilChanged((a, b) => a.status === b.status),
    filter((m) => m.status !== 'ok'),
    share(),
  );

  private count = 0;
  private anomalyTicksLeft = 0;

  generateRaw(): Omit<Measurement, 'status'> {
    const t = this.count;
    const warmup = -CONFIG.warmupAmp * Math.exp(-t / CONFIG.warmupTau);
    const drift =
      CONFIG.driftAmp * Math.sin((2 * Math.PI * t) / CONFIG.driftPeriod);
    const noise = CONFIG.noiseStd * this.gaussian();
    const anomaly = this.anomalyOffset();
    const value = Number(
      (CONFIG.nominal + warmup + drift + noise + anomaly).toFixed(2),
    );
    return { count: this.count++, value, timestamp: Date.now() };
  }

  private evaluate(value: number): MeasurementStatus {
    if (value < CONFIG.lower || value > CONFIG.upper) return 'critical';
    if (
      value < CONFIG.nominal - CONFIG.warn ||
      value > CONFIG.nominal + CONFIG.warn
    )
      return 'warning';
    return 'ok';
  }
  private gaussian(): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  private anomalyOffset(): number {
    if (this.anomalyTicksLeft === 0 && Math.random() < 0.015) {
      this.anomalyTicksLeft = 6;
    }
    if (this.anomalyTicksLeft > 0) {
      this.anomalyTicksLeft--;
      return -4.2;
    }
    return 0;
  }
}
