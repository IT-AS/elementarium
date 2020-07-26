import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';
import { ActionTypes, LobbyGamesRequest, LobbyGameCreationRequest, LobbyGameJoiningRequest } from './lobby.actions';
import { Router } from '@angular/router';
 
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

  joinGame$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.LobbyGameJoinAction),
    map((action: any) => {
        this.socketService.joinGame(action.payload);
        return LobbyGameJoiningRequest();
    }))
  );

  joinedGame$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.LobbyGameJoinedAction),
    tap((action: any) => {
      this.router.navigate(['/game']);
    })), { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private socketService: SocketService
  ) {}
}