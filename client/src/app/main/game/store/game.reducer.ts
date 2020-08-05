import { Action, createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions'
import Game from '../../../../../../shared/engine/game';
import { Side } from '../../../../../../shared/engine/enums/side';
import Board from '../../../../../../shared/engine/board';
import Field from '../../../../../../shared/engine/field';
import Move from '../../../../../../shared/engine/moves/move';
import Unit from '../../../../../../shared/engine/unit';

export default interface GameState {
    game: Game,
    moves: number,
    history: Move[],
    side: Side,
    selectedField: Field,
};

export const InitialState: GameState = {
    game: null,
    moves: 0,
    history: [],
    side: Side.Gray,
    selectedField: null,
}

const reducer = createReducer(
    InitialState,
    on(GameActions.GameSideAssigned, (state: GameState, action: { payload }) => ({...state, side: action.payload})),
    on(GameActions.GameReceive, (state: GameState, action: { payload }) => ({...state, game: action.payload})),
    on(GameActions.FieldActivate, (state: GameState, action: { payload }) => fieldActivate(state, action)),
    on(GameActions.FieldDeactivate, (state: GameState, action: { payload }) => fieldDeactivate(state, action)),
    on(GameActions.FieldMoveHere, (state: GameState, action: { payload }) => fieldMoveHere(state, action)),
    on(GameActions.FieldMoveUndo, (state: GameState, action) => fieldMoveUndo(state, action)),
);
  
export function GameReducer(state: GameState | undefined, action: Action) {
    return reducer(state, action);
}

function fieldActivate(state: GameState, action: { payload } ) : GameState {
    if(state.moves >= state.game.movesPerTurn) { return state; }

    const game: Game = Game.clone(state.game);
    const field: Field = Field.clone(action.payload);
    for(const move of game.board.moves(action.payload, state.side) ) {
        game.board.fields[move[0]][move[1]].moveHere = true;
    }

    return {...state, selectedField: game.board.fields[field.row][field.column], game: game};
}

function fieldDeactivate(state: GameState, action: { payload } ) : GameState {
    const game: Game = Game.clone(state.game);
    for(const line of game.board.fields) {
        for(const field of line) {
            field.moveHere = false;
        }
    }

    return {...state, selectedField: null, game: game};
}

function fieldMoveHere (state: GameState, action: { payload } ) : GameState {
    const sourceField: Field = Field.clone(state.selectedField);
    const targetField: Field = Field.clone(action.payload);

    if(sourceField.current.type && targetField.moveHere) {
        if (sourceField.current.side === Side.Green) { 
            targetField.greenCandidate = sourceField.current;
            sourceField.greenLast = sourceField.current;
        }
        if (sourceField.current.side === Side.Red) { 
            targetField.redCandidate = sourceField.current; 
            sourceField.redLast = sourceField.current;
        }

        sourceField.current = null;
        const game: Game = Game.clone(state.game);
        game.board.fields[sourceField.row][sourceField.column] = sourceField;
        game.board.fields[targetField.row][targetField.column] = targetField;
        
        const history: Move[] = state.history.filter(m => true);
        history.push({ from: [sourceField.row, sourceField.column], to: [targetField.row, targetField.column], side: state.side } as Move);

        return {...state, selectedField: null, game: game, moves: state.moves + 1, history: history};
    }

    return state;
}

function fieldMoveUndo (state: GameState, action ) : GameState {

    if (state.history.length > 0) {
        const history: Move[] = state.history.filter(m => true);
        const move: Move = history.pop();

        const sourceField: Field = Field.clone(state.game.board.fields[move.from[0]][move.from[1]]);
        const targetField: Field = Field.clone(state.game.board.fields[move.to[0]][move.to[1]]);

        if (sourceField && targetField) {
            const unit: Unit = targetField.candidate(move.side);

            sourceField.current = unit;

            // We can delete them both without taking care about the side
            // because only one side will have data here
            targetField.greenCandidate = null;
            targetField.redCandidate = null;

            const game: Game = Game.clone(state.game);
            game.board.fields[sourceField.row][sourceField.column] = sourceField;
            game.board.fields[targetField.row][targetField.column] = targetField;

            return {...state, selectedField: null, game: game, moves: state.moves - 1, history: history};
        }
    }

    return state;
}