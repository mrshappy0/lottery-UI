import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LotteryLandingPageComponent } from './lottery-landing-page/lottery-landing-page.component';
import { WalletComponent } from './wallet/wallet.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    LotteryLandingPageComponent,
    WalletComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
