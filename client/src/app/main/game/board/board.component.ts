import { Component, OnInit, Input, HostListener } from '@angular/core';
import Board from '../../../../../../shared/engine/board';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  @Input()
  public board: Board;

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
