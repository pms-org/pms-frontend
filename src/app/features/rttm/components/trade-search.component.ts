import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RttmApiService, TradeEvent } from '../../../core/services/rttm-api.service';

interface StageStatus {
  name: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
}

interface TradeStatus {
  tradeId: string;
  stages: StageStatus[];
  hasErrors: boolean;
}

@Component({
  selector: 'app-trade-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 class="text-lg font-bold text-white mb-4">Find Your Trade</h3>
      
      <div class="flex gap-3 mb-4">
        <input
          type="text"
          [(ngModel)]="tradeId"
          placeholder="Enter your Trade ID"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          (click)="searchTrade()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      <div *ngIf="tradeStatus()" class="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-6">
          <span class="text-gray-400 text-sm">Trade ID: <span class="text-white font-medium">{{ tradeStatus()?.tradeId }}</span></span>
          <span *ngIf="tradeStatus()?.hasErrors" class="bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">⚠ Errors Detected</span>
          <span *ngIf="!tradeStatus()?.hasErrors" class="bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">✓ All Stages Successful</span>
        </div>
        
        <div class="flex items-start gap-3 overflow-x-auto pb-2">
          <ng-container *ngFor="let stage of tradeStatus()?.stages; let last = last">
            <!-- Stage Card -->
            <div class="flex-shrink-0 min-w-[180px]">
              <div [ngClass]="{
                'border-green-500 bg-green-500/10': stage.status === 'success',
                'border-red-500 bg-red-500/10': stage.status === 'error',
                'border-gray-600 bg-gray-800/50': stage.status === 'pending'
              }" class="border-2 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                  <div [ngClass]="{
                    'bg-green-500': stage.status === 'success',
                    'bg-red-500': stage.status === 'error',
                    'bg-gray-600': stage.status === 'pending'
                  }" class="w-3 h-3 rounded-full flex-shrink-0"></div>
                  <span [ngClass]="{
                    'text-green-400': stage.status === 'success',
                    'text-red-400': stage.status === 'error',
                    'text-gray-500': stage.status === 'pending'
                  }" class="text-sm font-bold">{{ stage.name }}</span>
                </div>
                <div *ngIf="stage.message" [ngClass]="{
                  'text-red-400': stage.status === 'error',
                  'text-gray-400': stage.status !== 'error'
                }" class="text-xs leading-relaxed">{{ stage.message }}</div>
              </div>
            </div>
            
            <!-- Arrow -->
            <div *ngIf="!last" class="flex items-center flex-shrink-0 pt-6">
              <div class="text-gray-600 text-2xl">→</div>
            </div>
          </ng-container>
        </div>
      </div>

      <div *ngIf="notFound()" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
        Trade ID not found in the pipeline
      </div>
    </div>
  `
})
export class TradeSearchComponent {
  private rttmApi = inject(RttmApiService);
  tradeId = '';
  tradeStatus = signal<TradeStatus | null>(null);
  notFound = signal(false);

  searchTrade() {
    this.notFound.set(false);
    this.tradeStatus.set(null);

    if (!this.tradeId.trim()) return;
    
    this.rttmApi.trackTrade(this.tradeId.trim()).subscribe({
      next: (events) => {
        if (!events || events.length === 0) {
          this.notFound.set(true);
          return;
        }

        const stageOrder = ['RECEIVED', 'VALIDATED', 'ENRICHED', 'COMMITTED'];
        const stageMap = new Map<string, StageStatus>();

        // Initialize all stages as pending
        stageOrder.forEach(stage => {
          stageMap.set(stage, { name: stage, status: 'pending' });
        });

        let errorOccurred = false;
        let errorStageIndex = -1;

        // Process events in stage order
        stageOrder.forEach((stageName, index) => {
          const stageEvents = events.filter(e => e.eventStage === stageName);
          const stage = stageMap.get(stageName)!;

          if (stageEvents.length > 0) {
            // Check for errors first
            const errorEvent = stageEvents.find(e => e.sourceTable === 'ERROR' || e.sourceTable === 'DLQ');
            
            if (errorEvent) {
              stage.status = 'error';
              stage.message = errorEvent.message;
              errorOccurred = true;
              errorStageIndex = index;
            } else {
              const successEvent = stageEvents.find(e => e.sourceTable === 'TRADE_EVENT');
              if (successEvent && !errorOccurred) {
                stage.status = 'success';
                stage.message = successEvent.message;
              }
            }
          }

          // Mark remaining stages as blocked if error occurred
          if (errorOccurred && index > errorStageIndex) {
            stage.status = 'pending';
            stage.message = undefined;
          }
        });

        const stages = stageOrder.map(stage => stageMap.get(stage)!);
        const hasErrors = stages.some(s => s.status === 'error');

        this.tradeStatus.set({
          tradeId: this.tradeId.trim(),
          stages,
          hasErrors
        });
      },
      error: () => {
        this.notFound.set(true);
      }
    });
  }
}
