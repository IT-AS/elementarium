import { createAction, props } from "@ngrx/store";
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';
import { JoinInfo } from '../../../../../../shared/lobby/joinInfo';
import Game from '../../../../../../shared/engine/game';

export enum ActionTypes{
  LobbyGamesGetAction = '[Lobby] Games Get',
  LobbyGamesRequestAction = '[Lobby] Games Request',
  LobbyGamesUpdateAction = '[Lobby] Games Update',
  LobbyGameCreateAction = '[Lobby] Game Create',
  LobbyGameCreationRequestAction = '[Lobby] Game Creation Request',
  LobbyGameDeleteAction = '[Lobby] Game Delete',
  LobbyGameDeletionRequestAction = '[Lobby] Game Deletion Request',
  LobbyGameJoinAction = '[Lobby] Game Join',
  LobbyGameJoiningRequestAction = '[Lobby] Game Joining Request',
  LobbyGameJoinedAction = '[Lobby] Game Joined',
};

export const LobbyGamesGet = createAction(
  ActionTypes.LobbyGamesGetAction
);

export const LobbyGamesRequest = createAction(
  ActionTypes.LobbyGamesRequestAction
);

export const LobbyGamesUpdate = createAction(
  ActionTypes.LobbyGamesUpdateAction,
  props<{ payload: GameInfo[] }>()
);

export const LobbyGameCreate = createAction(
  ActionTypes.LobbyGameCreateAction,
  props<{ gameId: string, gamePassword: string }>()
);

export const LobbyGameCreationRequest = createAction(
  ActionTypes.LobbyGameCreationRequestAction
);

export const LobbyGameDelete = createAction(
  ActionTypes.LobbyGameDeleteAction,
  props<{ gameId: string, gamePassword: string }>()
);

export const LobbyGameDeletionRequest = createAction(
  ActionTypes.LobbyGameDeletionRequestAction
);

export const LobbyGameJoin = createAction(
  ActionTypes.LobbyGameJoinAction,
  props<{ payload: JoinInfo }>()
);

export const LobbyGameJoiningRequest = createAction(
  ActionTypes.LobbyGameJoiningRequestAction
);

export const LobbyGameJoined = createAction(
  ActionTypes.LobbyGameJoinedAction,
  props<{ payload: Game }>()
);
