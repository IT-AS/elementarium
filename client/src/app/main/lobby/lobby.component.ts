import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  public newGame: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  public openNewGame(): void {
    this.newGame = true;
  }

  public closeNewGame(): void {
    this.newGame = false;
  }
}
