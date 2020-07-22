import { createAction, props } from "@ngrx/store";
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';

export enum ActionTypes{
  LobbyGamesGetAction = '[Lobby] Games Get',
  LobbyGamesRequestAction = '[Lobby] Games Request',
  LobbyGamesUpdateAction = '[Lobby] Games Update',
  LobbyGameCreateAction = '[Lobby] Game Create',
  LobbyGameRequestAction = '[Lobby] Game Request'
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

export const LobbyGameRequest = createAction(
  ActionTypes.LobbyGameRequestAction
);
