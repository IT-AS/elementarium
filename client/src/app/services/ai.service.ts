import { Injectable } from '@angular/core';
import Board from '../../../../shared/engine/board';
import Move from '../../../../shared/engine/moves/move';
import { Direction } from '../../../../shared/engine/moves/direction';
import { Side } from '../../../../shared/engine/enums/side';
import Rules from '../../../../shared/engine/rules';
import { TurnEvent } from '../../../../shared/engine/events/turnEvent';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor() {   }

  public next(board: Board, movesPerTurn: number, side: Side) : Move[] {
    const randomizer: number = 3;
    const t1 = performance.now();
    const turns: Move[][] = this.turns(board.targets.filter(d => d.side === side), movesPerTurn);

    let spawnline_begin = 0;
    let spawnline_end = board.dimension;

    if(side === Side.Red) { 
      spawnline_begin = Rules.territory[Side.Green];
      spawnline_end = board.dimension;
    }

    if(side === Side.Green) { 
      spawnline_begin = 0;
      spawnline_end = Rules.territory[Side.Red];
    }
    
    const b: Board = Board.clone(board);
    const candidates: {moves: Move[], score: number}[] = [];
    for(let turn = 0, n = turns.length; turn < n; turn++) {

      let valid = true;
      for(const move of turns[turn]) {
        valid = b.dirty_move(move.from[0], move.from[1], move.to[0], move.to[1])
        if(!valid) { break; }
      }

      if (valid) {
        const result: TurnEvent = b.dirty_resolve(spawnline_begin, spawnline_end);
        const evaluation: number = this.evaluate(b, result, side);

        candidates.push({moves: turns[turn], score: evaluation});
      }

      b.dirty_restore(board);
    }

    candidates.sort((a,b) => b.score - a.score);

    const t2 = performance.now();
    console.log("complete() needs " + (t2 - t1) + " milliseconds.")
    
    /*
    for(const candidate of candidates.slice(0,5)) {
      for(const move of candidate.moves) {
        console.log(move);
      }
      console.log(candidate.score);
    }    
    */

    const choice: number = Math.round(Math.random() * randomizer);
    return candidates[choice].moves;
  }

  private turns(targets: Direction[], moves: number): Move[][] {
    const indices = Array.from(Array(targets.length).keys());
    const combis = this.combinations(indices, moves);
    const turns: Move[][] = [];

    for(const combi of combis) {
      const targetCombi: Move[][] = [];
      for(const index of combi) {
        targetCombi.push(this.flatten(targets[index]));
      }

      const turn = this.resolve(targetCombi);
      for(let i=0, n=turn.length; i<n; i++) {
        turns.push(turn[i]);
      }
    }
    
    return turns;
  }

  private evaluate(board: Board, turn: TurnEvent, side: Side): number {

    let result: number = 0;

    // Win = +999999
    // Lose = -999999
    // Spawn = +1000n
    // Capture = +1000n
    // Total targets = +10n

    // More ideas:
    // Total piecess on enemy zone = +1n
    // Fields around own source protected = +10
    // Fields around enemy source attacked = -10

    // Strategy ideas:
    // If we have more units, seek for aggressive play and maximize unit count in enemy zone
    // IF we have less units, seek for defensive play and maximize unit count in own and neutral zone

    // Check win/lose
    if(turn.winner === side) { result = 999999; }
    if(turn.winner === Rules.opponent(side) ) { result = -999999; }
    
    // Check spawns
    for(let i = 0; i < turn.spawns.length; i++) {
      if(turn.spawns[i].unit?.side === side) { result += 1000; }
      if(turn.spawns[i].unit?.side !== side) { result -= 1000; }
    }

    // Check captures
    for(let i = 0; i < turn.captures.length; i++) {
      if(turn.captures[i].unit?.side === side) { result -= 1000; }
      if(turn.captures[i].unit?.side !== side) { result += 1000; }
    }

    // Check unit activity
    result += board.dirty_moves(side) * 10;

    return result;
  }

  private flatten(target: Direction): Move[] {
    return target.to.map(t => ({from: target.from, to: t} as Move));
  }

  private resolve(moves: Move[][]): Move[][] {
    const result: Move[][] = [];

    if(moves?.length === 0) { return [] };
    if(moves?.length === 1) { return moves };
    if(moves?.length === 2) { return [].concat(...moves[0].map(d => moves[1].map(e => [].concat(d, e)))); }

    return [].concat(...moves[0].map(d => this.resolve(moves.slice(1)).map(e => [].concat(d, e))));
  }

  private combinations(array: number[], k: number) {
    let i: number, j: number;
    let result = [];
    let head: number[];
    let tailcombs;
    
    // Handling edge cases
    if (k > array.length || k <= 0) { return []; }
    
    if (k === array.length) { return [array]; }

    if (k === 1) {
      for (i = 0; i < array.length; i++) {
        result.push([array[i]]);
      }
      return result;
    }

    for (i = 0; i < array.length - k + 1; i++) {
      // head is a list that includes only our current element.
      head = array.slice(i, i + 1);
      // We take smaller combinations from the subsequent elements
      tailcombs = this.combinations(array.slice(i + 1), k - 1);
      // For each (k-1)-combination we join it with the current
      // and store it to the set of k-combinations.
      for (j = 0; j < tailcombs.length; j++) {
        result.push(head.concat(tailcombs[j]));
      }
    }

    return result;
  }
}
