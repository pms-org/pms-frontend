import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioSectorSlice } from '../../../../../core/models/portfolio-ui.models';

@Component({
  selector: 'app-portfolio-sector-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-sector-chart.html'
})
export class PortfolioSectorChartComponent {
  sectors = input<PortfolioSectorSlice[]>([]);
  
  liveData = Array.from({length: 24}, (_, i) => Math.random() * 1000 + 5000);
  historyData = Array.from({length: 30}, (_, i) => Math.random() * 2000 + 48000);
}
