import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioCharts } from './portfolio-charts';

describe('PortfolioCharts', () => {
  let component: PortfolioCharts;
  let fixture: ComponentFixture<PortfolioCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
