import { createAction, props } from "@ngrx/store";
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';

export enum ActionTypes{
  LobbyGamesGetAction = '[Lobby] Games Get',
  LobbyGamesRequestAction = '[Lobby] Games Request',
  LobbyGamesUpdateAction = '[Lobby] Games Update'
}

export const LobbyGamesGet = createAction(
  ActionTypes.LobbyGamesGetAction
)

export const LobbyGamesRequest = createAction(
  ActionTypes.LobbyGamesRequestAction
)

export const LobbyGamesUpdate = createAction(
  ActionTypes.LobbyGamesUpdateAction,
  props<{ payload: GameInfo[] }>()
);
