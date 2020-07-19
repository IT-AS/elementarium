import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {APP_ROUTES} from './routes/app.routes';
import {SharedModule} from '../shared/shared.module';
import { LobbyComponent } from './lobby/lobby.component';
import { SocketService } from '../services/socket.service';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(APP_ROUTES),
    SharedModule.forRoot()
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
