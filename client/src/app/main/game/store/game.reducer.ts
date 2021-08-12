import { Action, createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions'
import Game from '../../../../../../shared/engine/game';
import { Side } from '../../../../../../shared/engine/enums/side';
import Field from '../../../../../../shared/engine/field';
import Move from '../../../../../../shared/engine/moves/move';
import { TokenInfo } from '../../../../../../shared/lobby/tokenInfo';

export default interface GameState {
    game: Game,
    moves: number,
    history: Move[],
    side: Side,
    selectedField: Field,
    targets: number[][],
    lastMove: { from: Field, to: Field },
    tokenInfo: TokenInfo,
};

export const InitialState: GameState = {
    game: null,
    moves: 0,
    history: [],
    side: Side.Gray,
    selectedField: null,
    targets: [],
    lastMove: null,
    tokenInfo: null,
}

const reducer = createReducer(
    InitialState,
    on(GameActions.GameSideAssigned, (state: GameState, action: { payload }) => ({...state, side: action.payload})),
    on(GameActions.GameReceive, (state: GameState, action: { payload }) => ({...state, game: action.payload, moves: 0, history: [], lastMove: null})),
    on(GameActions.FieldActivate, (state: GameState, action: { payload }) => fieldActivate(state, action)),
    on(GameActions.FieldDeactivate, (state: GameState, action: { payload }) => fieldDeactivate(state, action)),
    on(GameActions.FieldMoveHere, (state: GameState, action: { payload }) => fieldMoveHere(state, action)),
    on(GameActions.FieldMoveUndo, (state: GameState, action) => fieldMoveUndo(state, action)),
    on(GameActions.TokenChanged, (state: GameState, action: { payload }) => ({...state, tokenInfo: action.payload})),
);
  
export function GameReducer(state: GameState | undefined, action: Action) {
    return reducer(state, action);
}

function fieldActivate(state: GameState, action: { payload } ) : GameState {
    if(state.moves >= state.game.movesPerTurn) { return state; }

    return {...state,
        selectedField: state.game.board.fields[action.payload.row][action.payload.column], 
        targets: state.game.board.moves(action.payload, state.side)};
}

function fieldDeactivate(state: GameState, action: { payload } ) : GameState {

    return {...state, selectedField: null, targets: []};
}

function fieldMoveHere (state: GameState, action: { payload } ) : GameState {
    const sourceField: Field = state.selectedField;
    const targetField: Field = action.payload;

    
    if(sourceField.current.type) {
        const history: Move[] = state.history.filter(m => true);
        history.push({ from: [sourceField.row, sourceField.column], to: [targetField.row, targetField.column] } as Move);

        return {...state, 
            selectedField: null, 
            moves: state.moves + 1, 
            history: history, 
            lastMove: { from: sourceField, to: targetField }
        };
    }

    return state;
}

function fieldMoveUndo (state: GameState, action ) : GameState {

    if (state.history.length > 0 && state.lastMove?.from && state.lastMove?.to) {
        const history: Move[] = state.history.filter(m => true);
        const move: Move = history.pop();
        const sourceField: Field = Field.clone(state.game.board.fields[move.from[0]][move.from[1]]);
        const targetField: Field = Field.clone(state.game.board.fields[move.to[0]][move.to[1]]);
        if(state.side === Side.Green) { targetField.greenCandidate = sourceField.current; }
        if(state.side === Side.Red) { targetField.redCandidate = sourceField.current; }
        targetField.current = null;

        const lastMove = { from: targetField, to: sourceField };

        return {...state, 
            selectedField: null, 
            moves: state.moves - 1, 
            history: history,
            lastMove: lastMove
        };
    }

    return state;
}
