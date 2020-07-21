import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {APP_ROUTES} from './routes/app.routes';
import {SharedModule} from '../shared/shared.module';
import { LobbyComponent } from './lobby/lobby.component';
import { SocketService } from '../services/socket.service';
import { StoreModule } from '@ngrx/store';
import { LobbyReducer } from './lobby/store/lobby.reducer';
import { EffectsModule } from '@ngrx/effects';
import { LobbyEffects } from './lobby/store/lobby.effects';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(APP_ROUTES),
    SharedModule.forRoot(),
    StoreModule.forRoot({lobby: LobbyReducer}),
    EffectsModule.forRoot([LobbyEffects])
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
