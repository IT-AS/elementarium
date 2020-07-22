import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { LobbyGameDelete } from '../store/lobby.actions';
import LobbyState from '../store/lobby.state';

@Component({
  selector: 'app-game-deletion',
  templateUrl: './game-deletion.component.html',
  styleUrls: ['./game-deletion.component.scss']
})
export class GameDeletionComponent implements OnInit {

  @Input()
  public visible: boolean = false;

  @Output()
  public closing = new EventEmitter();

  @Input()
  public gameId: string;
  public gamePassword: string = '';

  constructor(private store: Store<LobbyState>) { }

  ngOnInit(): void {
  }

  public close(): void {
    this.closing.emit();
  }

  public deleteGame(): void {
    this.store.dispatch(LobbyGameDelete({ gameId: this.gameId, gamePassword: this.gamePassword}));
    this.closing.emit();
  }

  public visibility(): string {
    return this.visible ? 'show' : 'hidden';
  }  
}
