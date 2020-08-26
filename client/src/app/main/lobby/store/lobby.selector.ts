import { createSelector, createFeatureSelector } from '@ngrx/store';
import LobbyState from './lobby.reducer';
 
export const selectLobbyState = createFeatureSelector<LobbyState>('lobby');
export const selectGames = createSelector(
    selectLobbyState,
    (state) => {
        return state?.games;
    }
);