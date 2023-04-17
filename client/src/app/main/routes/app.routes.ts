import {Routes} from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';
import { GameComponent } from '../game/game.component';
import { StaticComponent } from 'src/app/static/static.component';

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
  { path: 'story', component: StaticComponent },
  { path: 'howto', component: StaticComponent },
  { path: 'rules', component: StaticComponent },
  { path: 'privacy', component: StaticComponent },
  { path: '**', component: LobbyComponent },
];
