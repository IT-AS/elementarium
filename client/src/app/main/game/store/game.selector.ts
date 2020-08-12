import { createSelector, createFeatureSelector } from '@ngrx/store';
import GameState from './game.reducer';
 
export const selectGameState = createFeatureSelector<GameState>('game');
export const selectGame = createSelector(
    selectGameState,
    (state) => {
        return state.game;
    }
);

export const selectSelectedField = createSelector(
    selectGameState,
    (state) => {
        return state.selectedField;
    }
);


export const selectLastMove = createSelector(
    selectGameState,
    (state) => {
        return state.lastMove;
    }
);


export const selectTargets = createSelector(
    selectGameState,
    (state) => {
        return state.targets;
    }
);


export const selectSide = createSelector(
    selectGameState,
    (state) => {
        return state.side;
    }
);

export const selectHistory = createSelector(
    selectGameState,
    (state) => {
        return state.history;
    }
);
