import {Routes} from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';

export const APP_ROUTES: Routes = [
  {
    path: '**', component: LobbyComponent
  }
];
