import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SocketEvents } from "../../../../shared/engine/enums/socketevents";
import { LobbyGamesUpdate, LobbyGameJoined } from '../main/lobby/store/lobby.actions';
import { Store } from '@ngrx/store';
import LobbyState from '../main/lobby/store/lobby.reducer';
import { JoinInfo } from '../../../../shared/lobby/joinInfo';
import { GameInfo } from '../../../../shared/lobby/gameinfo';
import Game from '../../../../shared/engine/game';
import GameState from '../main/game/store/game.reducer';
import { GameReceive } from '../main/game/store/game.actions';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: any;

  constructor(private lobbyState: Store<LobbyState>, private gameState: Store<GameState>) {   }

  public initialize(): void {
    this.socket = io(environment.world);
    this.socket.on(SocketEvents.LIST, (data: any) => {
      const games: GameInfo[] = data;
      this.lobbyState.dispatch(LobbyGamesUpdate({ payload: games }));
    });
  }

  public getGames(): void {
    this.socket.emit(SocketEvents.LIST);
  }

  public createGame(gameId: string, gamePassword: string): void {
    this.socket.emit(SocketEvents.GAME, gameId, gamePassword);
  }

  public deleteGame(gameId: string, gamePassword: string): void {
    this.socket.emit(SocketEvents.DELETE, gameId, gamePassword);
  }

  public joinGame(joinInfo: JoinInfo): void {
    this.socket.on(this.getGameChannel(joinInfo.gameId), (data: any) => {
      const game: Game = data;
      this.lobbyState.dispatch(LobbyGameJoined({ payload: game }));
      this.gameState.dispatch(GameReceive({ payload: game }));
    });

    this.socket.emit(SocketEvents.JOIN, joinInfo);
  }

  private getGameChannel(gameId: string): string {
    return SocketEvents.GAME + '[' + gameId + ']';
}  
}
