import { Injectable } from '@angular/core';
import Board from '../../../../shared/engine/board';
import Move from '../../../../shared/engine/moves/move';
import { Direction } from '../../../../shared/engine/moves/direction';
import { Side } from '../../../../shared/engine/enums/side';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor() {   }

  public next(board: Board) : void {
    const movesPerTurn: number = 3;
    const side: Side = Side.Green;

    const t0 = performance.now();

    const turns: Move[][] = this.turns(board.targets.filter(d => d.side === side), movesPerTurn);

    const t1 = performance.now();
    console.log("turns() needs " + (t1 - t0) + " milliseconds.")

    for(const turn of turns.slice(0,1)) {
      const tt0 = performance.now();
      const b: Board = Board.clone(board);

      const tt1 = performance.now();
      console.log("clone() needs " + (tt1 - tt0) + " milliseconds.")

      for(const move of turn) {
        b.move(move.from[0], move.from[1], move.to[0], move.to[1], false);
      }
      const tt2 = performance.now();
      console.log("move() needs " + (tt2 - tt1) + " milliseconds.")

      const result = b.resolve(true);
      const tt3 = performance.now();

      console.log("resolve() needs " + (tt3 - tt2) + " milliseconds.")
    }

    const t2 = performance.now()
    console.log("complete() needs " + (t2 - t1) + " milliseconds.")
  }

  private turns(targets: Direction[], moves: number): Move[][] {
    const indices = Array.from(Array(targets.length).keys());
    const combis = this.combinations(indices, moves);
    let turns: Move[][] = [];

    for(const combi of combis) {
      const targetCombi: Move[][] = [];
      for(const index of combi) {
        targetCombi.push(this.flatten(targets[index]));
      }

      const turn = this.resolve(targetCombi);
      turns = [].concat(turns, turn);
    }
    
    return turns;
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
