import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RttmData } from '../../core/models/rttm.models';
import { MOCK_RTTM_DATA } from './mock-data';
import { MetricCardsComponent } from './components/metric-cards.component';
import { PipelineFlowComponent } from './components/pipeline-flow.component';
import { ChartsComponent } from './components/charts.component';
import { DlqPanelComponent } from './components/dlq-panel.component';
import { AlertsPanelComponent } from './components/alerts-panel.component';

@Component({
  selector: 'app-rttm',
  standalone: true,
  imports: [
    CommonModule,
    MetricCardsComponent,
    PipelineFlowComponent,
    ChartsComponent,
    DlqPanelComponent,
    AlertsPanelComponent
  ],
  templateUrl: './rttm.page.html',
  styleUrls: ['./rttm.page.css']
})
export class RttmPage {
  data = signal<RttmData>(MOCK_RTTM_DATA);
}
