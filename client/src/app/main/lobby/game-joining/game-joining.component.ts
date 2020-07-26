import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import LobbyState from '../store/lobby.reducer';
import { LobbyGameJoin } from '../store/lobby.actions';
import { Side } from '../../../../../../shared/engine/enums/side';
import { JoinInfo } from '../../../../../../shared/lobby/joinInfo';

@Component({
  selector: 'app-game-joining',
  templateUrl: './game-joining.component.html',
  styleUrls: ['./game-joining.component.scss']
})
export class GameJoiningComponent implements OnInit {
  
  @Input()
  public visible: boolean = false;

  @Output()
  public closing = new EventEmitter();

  @Input()
  public gameId: string = 'Game';
  public gamePassword: string = '12345';
  public playerName: string = 'Player1';
  @Input()
  public side: Side = Side.Green;

  public sides = Side;  

  constructor(private store: Store<LobbyState>) { }

  ngOnInit(): void {
  }

  public close(): void {
    this.closing.emit();
  }

  public joinGame(): void {
    const joinInfo: JoinInfo = { gameId: this.gameId, password: this.gamePassword, playerId: this.playerName, side: this.side };
    this.store.dispatch(LobbyGameJoin({payload: joinInfo}));
    this.closing.emit();
  }

  public visibility(): string {
    return this.visible ? 'show' : 'hidden';
  }

}
