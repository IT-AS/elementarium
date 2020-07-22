import { createAction, props } from "@ngrx/store";
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';

export enum ActionTypes{
  LobbyGamesGetAction = '[Lobby] Games Get',
  LobbyGamesRequestAction = '[Lobby] Games Request',
  LobbyGamesUpdateAction = '[Lobby] Games Update',
  LobbyGameCreateAction = '[Lobby] Game Create',
  LobbyGameCreationRequestAction = '[Lobby] Game Creation Request',
  LobbyGameDeleteAction = '[Lobby] Game Delete',
  LobbyGameDeletionRequestAction = '[Lobby] Game Deletion Request'
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
