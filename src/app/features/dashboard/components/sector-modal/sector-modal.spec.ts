import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorModal } from './sector-modal';

describe('SectorModal', () => {
  let component: SectorModal;
  let fixture: ComponentFixture<SectorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
