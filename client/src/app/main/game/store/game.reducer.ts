import { Action, createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions'
import Game from '../../../../../../shared/engine/game';

export default interface GameState {
    game: Game
};

export const InitialState: GameState = {
    game: null
};

const reducer = createReducer(
    InitialState,
    on(GameActions.GameReceive, (state: GameState, { payload }) => ({...state, game: payload}))
);
  
export function GameReducer(state: GameState | undefined, action: Action) {
    return reducer(state, action);
}

