// import { Injectable } from '@angular/core';
// import { Observable, share } from 'rxjs';
// import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
// import { ENDPOINTS, wsUrl } from '../config/endpoints';
// import { AnalysisEntityDto } from '../models/analytics.models';

// @Injectable({ providedIn: 'root' })
// export class AnalyticsWsHoldingsService {
//   private socket$?: WebSocketSubject<AnalysisEntityDto>;

//   stream(): Observable<AnalysisEntityDto> {
//     if (!this.socket$) {
//       this.socket$ = webSocket<AnalysisEntityDto>({
//         url: wsUrl(ENDPOINTS.analytics.baseWs, ENDPOINTS.analytics.wsPositions),
//         deserializer: (event) => JSON.parse((event as MessageEvent).data)
//       });
//     }
//     return this.socket$.pipe(share());
//   }
// }
