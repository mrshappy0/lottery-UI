import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotteryLandingPageComponent } from './lottery-landing-page.component';

describe('LotteryLandingPageComponent', () => {
  let component: LotteryLandingPageComponent;
  let fixture: ComponentFixture<LotteryLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LotteryLandingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotteryLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
