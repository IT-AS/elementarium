import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {APP_ROUTES} from './routes/app.routes';
import {SharedModule} from '../shared/shared.module';
import { LobbyComponent } from './lobby/lobby.component';
import { SocketService } from '../services/socket.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LobbyReducer } from './lobby/store/lobby.reducer';
import { LobbyEffects } from './lobby/store/lobby.effects';
import { GameListComponent } from './lobby/game-list/game-list.component';
import { GameEntryComponent } from './lobby/game-entry/game-entry.component';
import { GameCreationComponent } from './lobby/game-creation/game-creation.component';
import { GameDeletionComponent } from './lobby/game-deletion/game-deletion.component';
import { GameJoiningComponent } from './lobby/game-joining/game-joining.component';
import { GameComponent } from './game/game.component';
import { GameReducer } from './game/store/game.reducer';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    GameListComponent,
    GameEntryComponent,
    GameCreationComponent,
    GameDeletionComponent,
    GameJoiningComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(APP_ROUTES),
    SharedModule.forRoot(),
    StoreModule.forRoot({lobby: LobbyReducer, game: GameReducer}),
    EffectsModule.forRoot([LobbyEffects]),
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
