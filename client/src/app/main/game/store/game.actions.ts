import { createAction, props } from "@ngrx/store";
import Game from '../../../../../../shared/engine/game';

export enum ActionTypes{
  GameReceiveAction = '[Game] Receive',
  GameMoveAction = '[Game] Move',
  GameMoveRequestAction = '[Game] Move Request',
};

export const GameReceive = createAction(
  ActionTypes.GameReceiveAction,
  props<{ payload: Game }>()
);

export const GameMove = createAction(
  ActionTypes.GameMoveAction
);

export const GameMoveRequest = createAction(
  ActionTypes.GameMoveRequestAction
);