import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Websocket } from '../services/websocket';
import Chart from 'chart.js/auto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Measurement } from '../models/measurement';

const MAX_POINTS = 60;
const MIN_THRESHOLD = 95;
const MAX_THRESHOLD = 105;

@Component({
  selector: 'app-live-chart',
  standalone: true,
  imports: [AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-chart.html',
 styleUrl: './live-chart.scss',
})
export class LiveChart implements AfterViewInit {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly websocket = inject(Websocket);
  protected readonly connected$ = this.websocket.connected$;
  protected readonly latest$ = this.websocket.measurements$;
  private readonly destroyRef = inject(DestroyRef);
  private chart?: Chart;

  ngAfterViewInit() {
    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Puissance (mW)',
            data: [],
            borderColor: '#2a78d6',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.25,
          },
          {
            label: 'Max',
            data: [],
            borderColor: '#c0392b',
            borderWidth: 1,
            borderDash: [6, 4],
            pointRadius: 0,
            tension: 0,
          },
          {
            label: 'Min',
            data: [],
            borderColor: '#c0392b',
            borderWidth: 1,
            borderDash: [6, 4],
            pointRadius: 0,
            tension: 0,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 90, max: 110, title: { display: true, text: 'mW' } },
          x: { title: { display: true, text: 'Temps (s)' } },
        },
        plugins: { legend: { display: true } },
      },
    });

    this.websocket.measurements$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((m) => this.push(m));
  }

  private push(m: Measurement) {
    const chart = this.chart!;
    const labels = chart.data.labels as number[];
    const values = chart.data.datasets[0].data as number[];
    const maxLine = chart.data.datasets[1].data as number[];
    const minLine = chart.data.datasets[2].data as number[];

    labels.push(m.count);
    values.push(m.value);
    maxLine.push(MAX_THRESHOLD);
    minLine.push(MIN_THRESHOLD);

    if (labels.length > MAX_POINTS) {
      labels.shift();
      values.shift();
      maxLine.shift();
      minLine.shift();
    }

    chart.update('none')
  }
}
