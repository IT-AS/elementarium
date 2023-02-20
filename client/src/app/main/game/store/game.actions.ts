import { createAction, props } from "@ngrx/store";
import Game from '../../../../../../shared/engine/game';
import { TokenInfo } from '../../../../../../shared/lobby/tokeninfo';
import { MoveInfo } from '../../../../../../shared/lobby/moveinfo';
import Field from '../../../../../../shared/engine/field';
import { Side } from '../../../../../../shared/engine/enums/side';

export enum ActionTypes{
  GameSideAssignedAction = '[Game] Side Assigned',
  GameResumeAction = '[Game] Resume',
  GameResumeRequestAction = '[Game] Resume Request',
  GameReceiveAction = '[Game] Receive',
  GameMoveAction = '[Game] Move',
  GameMoveRequestAction = '[Game] Move Request',
  GameSurrenderAction = '[Game] Surrender',
  GameSurrenderRequestAction = '[Game] Surrender Request',
  FieldActivateAction = '[Field] Activate',
  FieldDeactivateAction = '[Field] Dectivate',
  FieldMoveHereAction = '[Field] Move Here',
  FieldMoveUndoAction = '[Field] Move Undo',
  TokenChangedAction = '[Token] Changed',
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
  ActionTypes.GameMoveAction,
  props<{ payload: MoveInfo }>()
);

export const GameMoveRequest = createAction(
  ActionTypes.GameMoveRequestAction
);

export const GameSurrender = createAction(
  ActionTypes.GameSurrenderAction,
  props<{ payload: TokenInfo }>()
);

export const GameSurrenderRequest = createAction(
  ActionTypes.GameSurrenderRequestAction
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

export const FieldMoveUndo = createAction(
  ActionTypes.FieldMoveUndoAction,
);

export const TokenChanged = createAction(
  ActionTypes.TokenChangedAction,
  props<{ payload: TokenInfo }>()
);
