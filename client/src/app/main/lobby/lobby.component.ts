import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  public newGame: boolean = false;

  private baseSize: number;

  public get lobbySize(): number {
    return this.baseSize * 0.9;
  }

  public get listSize(): number {
    return this.lobbySize * 0.85;
  }

  constructor() {
    this.getScreenSize();
  }

  ngOnInit(): void {
  }

  public openNewGame(): void {
    this.newGame = true;
  }

  public closeNewGame(): void {
    this.newGame = false;
  }

  @HostListener('window:resize', ['$event'])
  private getScreenSize(event?) {
    this.baseSize = Math.min(window.innerHeight, window.innerWidth);
  }
}
