import { Component, OnInit, Input } from '@angular/core';
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';
import { Side } from '../../../../../../shared/engine/enums/side';

@Component({
  selector: 'app-game-entry',
  templateUrl: './game-entry.component.html',
  styleUrls: ['./game-entry.component.scss']
})
export class GameEntryComponent implements OnInit {

  @Input()
  public game: GameInfo;

  public deleteGame: boolean = false;
  public joinGame: boolean = false;

  public joinSide: Side = Side.Green;

  public Side = Side;

  constructor() { }

  ngOnInit(): void {
  }

  public get playerInfo(): string {
    let green: string = '??';
    let red: string = '??';
    
    if(this.getJoined(Side.Green)) {
      green = this.game?.players.filter(player => player.side === Side.Green)[0].name + '(Green)';
    }

    if(this.getJoined(Side.Red)) {
      red = this.game?.players.filter(player => player.side === Side.Red)[0].name + '(Red)';
    }

    return green + ' vs ' + red;
  }

  public getJoined(side: Side): boolean {
    return ( this.game?.players[0] && this.game?.players[0].side === side ) ||
           ( this.game?.players[1] && this.game?.players[1].side === side );
  }

  public openDeleteGame(): void {
    this.deleteGame = true;
  }

  public openJoinGame(side: Side): void {
    this.joinSide = side;
    this.joinGame = true;
  }

  public closeDeleteGame(): void {
    this.deleteGame = false;
  }

  public closeJoinGame(): void {
    this.joinGame = false;
  }
}
