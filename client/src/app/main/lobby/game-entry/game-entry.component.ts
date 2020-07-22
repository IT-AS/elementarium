import { Component, OnInit, Input } from '@angular/core';
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';

@Component({
  selector: 'app-game-entry',
  templateUrl: './game-entry.component.html',
  styleUrls: ['./game-entry.component.scss']
})
export class GameEntryComponent implements OnInit {

  @Input()
  public game: GameInfo;

  public deleteGame: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  public openDeleteGame(): void {
    this.deleteGame = true;
  }

  public closeDeleteGame(): void {
    this.deleteGame = false;
  }
}
