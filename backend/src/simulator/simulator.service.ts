import { Injectable } from '@nestjs/common';
import { Measurement } from '../measurement.interface';
import { interval, map, Observable, share } from 'rxjs';

@Injectable()
export class SimulatorService {
  readonly measurements$: Observable<Measurement> = interval(1000).pipe(
    map(() => this.generate()),
    share(),
  );

  private count = 0;
  private anomalyTicksLeft = 0;
  private readonly NOMINAL = 100;
  private readonly WARMUP_AMP = 3.5;
  private readonly WARMUP_TAU = 12;
  private readonly DRIFT_AMP = 0.6;
  private readonly DRIFT_PERIOD = 45;
  private readonly NOISE_STD = 0.35;

  generate(): Measurement {
    const t = this.count;

    const warmup = -this.WARMUP_AMP * Math.exp(-t / this.WARMUP_TAU);
    const drift =
      this.DRIFT_AMP * Math.sin((2 * Math.PI * t) / this.DRIFT_PERIOD);
    const noise = this.NOISE_STD * this.gaussian();
    const anomaly = this.anomalyOffset();

    const value = Number(
      (this.NOMINAL + warmup + drift + noise + anomaly).toFixed(2),
    );
    return { count: this.count++, value, timestamp: Date.now() };
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
