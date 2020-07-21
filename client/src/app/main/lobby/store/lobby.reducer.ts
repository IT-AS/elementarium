import { Action, createReducer, on } from '@ngrx/store';
import ApplicationState from './lobby.state';
import * as LobbyActions from './lobby.actions'
import { InitialState } from './lobby.state';

const reducer = createReducer(
    InitialState,
    on(LobbyActions.LobbyGamesUpdate, (state: ApplicationState, { payload }) => ({...state, games: payload}))
);
  
export function LobbyReducer(state: ApplicationState | undefined, action: Action) {
    return reducer(state, action);
}