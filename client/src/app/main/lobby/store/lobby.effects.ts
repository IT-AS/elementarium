import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';
import { ActionTypes, LobbyGamesRequest, LobbyGameCreationRequest } from './lobby.actions';
 
@Injectable()
export class LobbyEffects {
 
  getGames$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.LobbyGamesGetAction),
    map(() => {
        this.socketService.getGames();
        return LobbyGamesRequest();
    }))
  );
 
  createGame$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.LobbyGameCreateAction),
    map((action: any) => {
        this.socketService.createGame(action.gameId, action.gamePassword);
        return LobbyGameCreationRequest();
    }))
  );

  deleteGame$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.LobbyGameDeleteAction),
    map((action: any) => {
        this.socketService.deleteGame(action.gameId, action.gamePassword);
        return LobbyGameCreationRequest();
    }))
  );

  constructor(
    private actions$: Actions,
    private socketService: SocketService
  ) {}
}