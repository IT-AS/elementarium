import {Routes} from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';
import { GameComponent } from '../game/game.component';

export const APP_ROUTES: Routes = [
  { 
    path: 'game', component: GameComponent,
    children: [
      {
        path: '**',
        component: GameComponent
      }
    ]
  },
  { path: '**', component: LobbyComponent },
];
