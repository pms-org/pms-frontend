import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InvestorDto {
  portfolioId: string;
  name: string;
  phoneNumber: number;
  address: string;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.portfolio.baseHttp;

  getAllPortfolios(): Observable<InvestorDto[]> {
    return this.http.get<InvestorDto[]>(`${this.baseUrl}/api/portfolio/all`);
  }

  getPortfolioById(portfolioId: string): Observable<InvestorDto> {
    return this.http.get<InvestorDto>(`${this.baseUrl}/api/portfolio/${portfolioId}`);
  }
}
