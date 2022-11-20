import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenizedBallotLandingPageComponent } from './tokenized-ballot-landing-page.component';

describe('TokenizedBallotLandingPageComponent', () => {
  let component: TokenizedBallotLandingPageComponent;
  let fixture: ComponentFixture<TokenizedBallotLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenizedBallotLandingPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenizedBallotLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
