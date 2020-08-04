import { createAction, props } from "@ngrx/store";
import Game from '../../../../../../shared/engine/game';
import { TokenInfo } from '../../../../../../shared/lobby/tokenInfo';
import Field from '../../../../../../shared/engine/field';
import { Side } from '../../../../../../shared/engine/enums/side';

export enum ActionTypes{
  GameSideAssignedAction = "[Game] Side Assigned",
  GameResumeAction = '[Game] Resume',
  GameResumeRequestAction = '[Game] Resume Request',
  GameReceiveAction = '[Game] Receive',
  GameMoveAction = '[Game] Move',
  GameMoveRequestAction = '[Game] Move Request',
  FieldActivateAction = '[Field] Activate',
  FieldDeactivateAction = '[Field] Dectivate',
  FieldMoveHereAction = '[Field] Move Here',
};

export const GameSideAssigned = createAction(
  ActionTypes.GameSideAssignedAction,
  props<{ payload: Side }>()
);

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

export const FieldActivate = createAction(
  ActionTypes.FieldActivateAction,
  props<{ payload: Field }>()
);

export const FieldDeactivate = createAction(
  ActionTypes.FieldDeactivateAction,
  props<{ payload: Field }>()
);

export const FieldMoveHere = createAction(
  ActionTypes.FieldMoveHereAction,
  props<{ payload: Field }>()
);
