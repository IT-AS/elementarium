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
    const lines: Field[][] = this.board?.fields.filter(f => true);

    if(this.side === Side.Red) {
      lines.reverse();
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
