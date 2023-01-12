import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { LobbyGameCreate } from '../store/lobby.actions';
import LobbyState from '../store/lobby.reducer';

@Component({
  selector: 'app-game-creation',
  templateUrl: './game-creation.component.html',
  styleUrls: ['./game-creation.component.scss']
})
export class GameCreationComponent implements OnInit {

  @Input()
  public visible: boolean = false;

  @Output()
  public closing = new EventEmitter();

  public gameName: string = 'Game';
  public gamePassword: string = '12345';

  constructor(private store: Store<LobbyState>) { }

  ngOnInit(): void {
  }

  public close(): void {
    this.closing.emit();
  }

  public createGame(): void {
    this.store.dispatch(LobbyGameCreate({ gameName: this.gameName, gamePassword: this.gamePassword}));
    this.closing.emit();
  }

  public visibility(): string {
    return this.visible ? 'block' : 'none';
  }
}
