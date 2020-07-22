import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SocketEvents } from "../../../../shared/engine/enums/socketevents";
import { LobbyGamesUpdate } from '../main/lobby/store/lobby.actions';
import { GameInfo } from '../../../../shared/lobby/gameinfo';
import { Store } from '@ngrx/store';
import ApplicationState from '../main/lobby/store/lobby.state';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: any;

  constructor(private store: Store<ApplicationState>) {   }

  public initialize(): void {
    this.socket = io(environment.world);
    this.socket.on(SocketEvents.LIST, (data: any) => 
    {
      const games: GameInfo[] = data;
      this.store.dispatch(LobbyGamesUpdate({ payload: games }));
    });
  }

  public getGames(): void {
    this.socket.emit(SocketEvents.LIST);
  }

  public createGame(gameId: string, gamePassword: string): void {
    this.socket.emit(SocketEvents.GAME, gameId, gamePassword);
  }
}
