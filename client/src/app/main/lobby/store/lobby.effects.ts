import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';
import { ActionTypes, LobbyGamesRequest } from './lobby.actions';
 
@Injectable()
export class LobbyEffects {
 
  loadMovies$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.LobbyGamesGetAction),
    map(() => {
        this.socketService.getGames();
        return LobbyGamesRequest();
    }))
  );
 
  constructor(
    private actions$: Actions,
    private socketService: SocketService
  ) {}
}