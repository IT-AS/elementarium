import { Component, OnInit, Input, HostListener } from '@angular/core';
import Board from '../../../../../../shared/engine/board';
import Field from '../../../../../../shared/engine/field';
import { Side } from '../../../../../../shared/engine/enums/side';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  @Input()
  public board: Board;

  @Input()
  public side: Side;

  public get lines(): Field[][] {
    const lines: Field[][] = [];

    if(this.side === Side.Red) {
      for(let row = this.board?.fields.length-1; row>=0; row--) {
        const line = [];
        for(let col = this.board?.fields[row].length - 1; col>=0; col--) {
          line.push(this.board?.fields[row][col]);
        }
        lines.push(line);
      }
    } else {
      for(let row = 0; row<this.board?.fields.length; row++) {
        const line = [];
        for(let col = 0; col<this.board?.fields[row].length; col++) {
          line.push(this.board?.fields[row][col]);
        }
        lines.push(line);
      }
    }

    return lines;
  }

  private baseSize: number;

  public get boardSize(): number {
    return this.cellSize * this.board?.dimension;
  }

  public get cellSize(): number {
    return this.baseSize * 0.9 / this.board?.dimension - 1;
  }

  constructor() {
      this.getScreenSize();
  }

  ngOnInit(): void {
  }
  
  @HostListener('window:resize', ['$event'])
  private getScreenSize(event?) {
    this.baseSize = Math.min(window.innerHeight, window.innerWidth);
  }
}
