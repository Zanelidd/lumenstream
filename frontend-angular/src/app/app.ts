import { Component } from '@angular/core';
import { LiveChart } from './live-chart/live-chart';

@Component({
  selector: 'app-root',
  imports: [LiveChart],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
