import { Action, createReducer, on } from '@ngrx/store';
import * as LobbyActions from './lobby.actions'
import { GameInfo } from '../../../../../../shared/lobby/gameInfo'

export default interface LobbyState {
    games: GameInfo[]
}

export const InitialState: LobbyState = {
    games: []
};

const reducer = createReducer(
    InitialState,
    on(LobbyActions.LobbyGamesUpdate, (state: LobbyState, { payload }) => ({...state, games: payload}))
);
  
export function LobbyReducer(state: LobbyState | undefined, action: Action) {
    return reducer(state, action);
}