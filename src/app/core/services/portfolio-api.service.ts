import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RuntimeConfigService } from './runtime-config.service';

export interface InvestorDto {
  portfolioId: string;
  name: string;
  phoneNumber: string;
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly baseUrl = this.runtimeConfig.portfolio.baseHttp;

  getAllPortfolios(): Observable<InvestorDto[]> {
    return this.http.get<InvestorDto[]>(`${this.baseUrl}/api/portfolio/all`);
  }

  getPortfolioById(portfolioId: string): Observable<InvestorDto> {
    return this.http.get<InvestorDto>(`${this.baseUrl}/api/portfolio/${portfolioId}`);
  }
}
