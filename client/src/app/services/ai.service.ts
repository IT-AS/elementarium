import { Injectable } from '@angular/core';
import Board from '../../../../shared/engine/board';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor() {   }

  public next(board: Board) : void {
    console.log(board.targets.length);
    for(const target of board.targets) {
        console.log(target);
    }
  }
}
