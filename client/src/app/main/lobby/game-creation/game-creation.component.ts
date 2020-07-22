import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import LobbyState from '../store/lobby.state';
import { LobbyGameCreate } from '../store/lobby.actions';

@Component({
  selector: 'app-game-creation',
  templateUrl: './game-creation.component.html',
  styleUrls: ['./game-creation.component.scss']
})
export class GameCreationComponent implements OnInit {

  @Input()
  public visible: boolean;
  public visibility: string;

  @Output()
  public closing = new EventEmitter();

  public gameId: string = "Game";
  public gamePassword: string = "12345";

  constructor(private store: Store<LobbyState>) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.visibility = this.visible ? "show" : "hidden";
  }

  public close(): void {
    this.closing.emit();
  }

  public createGame():void {
    this.store.dispatch(LobbyGameCreate({ gameId: this.gameId, gamePassword: this.gamePassword}));
    this.closing.emit();
  }
}
