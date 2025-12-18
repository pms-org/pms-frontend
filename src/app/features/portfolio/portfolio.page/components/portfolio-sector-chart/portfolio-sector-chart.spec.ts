import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSectorChart } from './portfolio-sector-chart';

describe('PortfolioSectorChart', () => {
  let component: PortfolioSectorChart;
  let fixture: ComponentFixture<PortfolioSectorChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioSectorChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioSectorChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
