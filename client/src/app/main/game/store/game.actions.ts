import { createAction, props } from "@ngrx/store";
import Game from '../../../../../../shared/engine/game';
import { TokenInfo } from '../../../../../../shared/lobby/tokenInfo';

export enum ActionTypes{
  GameResumeAction = '[Game] Resume',
  GameResumeRequestAction = '[Game] Resume Request',
  GameReceiveAction = '[Game] Receive',
  GameMoveAction = '[Game] Move',
  GameMoveRequestAction = '[Game] Move Request',
};

export const GameResume = createAction(
  ActionTypes.GameResumeAction,
  props<{ payload: TokenInfo }>()
);

export const GameResumeRequest = createAction(
  ActionTypes.GameResumeRequestAction
);

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