import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TokenizedBallotLandingPageComponent } from './tokenized-ballot-landing-page/tokenized-ballot-landing-page.component';
// import { HeroListComponent } from './hero-list/hero-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { WalletComponent } from './wallet/wallet.component';

const routes: Routes = [
  { path: 'wallet', component: WalletComponent },
  { path: '', component: TokenizedBallotLandingPageComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
