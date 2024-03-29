import { Component, OnInit, Input, HostListener } from '@angular/core';
import Board from '../../../../../../shared/engine/board';
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

  private baseSize: number;

  public get borderSize(): number {
    return this.boardSize + 20;
  }

  public get boardSize(): number {
    return this.cellSize * this.board?.dimension;
  }

  public get cellSize(): number {
    return this.baseSize * 0.9 / this.board?.dimension - 1;
  }

  public get rotation(): string {
    if(this.side === Side.Red) {
      return 'rotate(180deg)'; 
    }

    return '';
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
