import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';
import { ActionTypes, GameMoveRequest, GameResumeRequest } from './game.actions';
 
@Injectable()
export class GameEffects {

  doResume$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.GameResumeAction),
    map((action: any) => {
        this.socketService.resumeGame(action.payload);
        return GameResumeRequest();
    }))
  );  

  doMove$ = createEffect(() => this.actions$.pipe(
    ofType(ActionTypes.GameMoveAction),
    map((action: any) => {
        this.socketService.move(action.payload);
        return GameMoveRequest();
    }))
  );

  constructor(
    private actions$: Actions,
    private socketService: SocketService
  ) {}
}