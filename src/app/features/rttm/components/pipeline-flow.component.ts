import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipelineStage } from '../../../core/models/rttm.models';

@Component({
  selector: 'app-pipeline-flow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline-flow.component.html',
  styleUrls: ['./pipeline-flow.component.css']
})
export class PipelineFlowComponent {
  stages = input<PipelineStage[]>([]);
}
