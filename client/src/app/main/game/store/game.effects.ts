import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';
import { ActionTypes, GameMoveRequest } from './game.actions';
 
@Injectable()
export class GameEffects {
 
  getGames$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.GameMoveAction),
    map(() => {
        // this.socketService.getGames();
        return GameMoveRequest();
    }))
  );

  constructor(
    private actions$: Actions,
    private socketService: SocketService
  ) {}
}