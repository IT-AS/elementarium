import { createSelector, createFeatureSelector } from '@ngrx/store';
import GameState from './game.reducer';
 
export const selectGameState = createFeatureSelector<GameState>('game');
export const selectGame = createSelector(
    selectGameState,
    (state) => {
        return state.game;
    }
);