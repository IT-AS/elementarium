import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { StringGeneratorService } from 'src/app/services/string-generator.service';
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

  constructor(private store: Store<LobbyState>, private stringGeneratorService: StringGeneratorService) { }

  ngOnInit(): void {
    this.gameName = this.stringGeneratorService.generateGameName();
    this.gamePassword = this.stringGeneratorService.generatePassword(8);  
  }

  public close(): void {
    this.closing.emit();
  }

  public createGame(): void {


    this.store.dispatch(LobbyGameCreate({ gameName: this.gameName, gamePassword: this.gamePassword}));
    this.closing.emit();
  }

  public visibility(style: string): string {
    return this.visible ? style : 'none';
  }
}
