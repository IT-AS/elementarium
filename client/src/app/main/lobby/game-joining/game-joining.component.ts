import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import LobbyState from '../store/lobby.reducer';
import { LobbyGameJoin } from '../store/lobby.actions';
import { Side } from '../../../../../../shared/engine/enums/side';
import { JoinInfo } from '../../../../../../shared/lobby/joininfo';
import { StringGeneratorService } from 'src/app/services/string-generator.service';

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
  public gameId: string;
  @Input()
  public gameName: string;
  public gamePassword: string = '';
  public playerName: string = 'Player1';
  public ai: boolean = false;
  @Input()
  public side: Side = Side.Green;

  constructor(private store: Store<LobbyState>, private stringGeneratorService: StringGeneratorService) {
    this.playerName = this.stringGeneratorService.generatePlayerName();
  }

  ngOnInit(): void {
  }

  public close(): void {
    this.closing.emit();
  }

  public joinGame(): void {
    const joinInfo: JoinInfo = { gameId: this.gameId, password: this.gamePassword, playerId: this.playerName, side: this.side, ai: this.ai };
    this.store.dispatch(LobbyGameJoin({payload: joinInfo}));
    this.closing.emit();
  }

  public visibility(style: string): string {
    return this.visible ? style : 'none';
  }

}
