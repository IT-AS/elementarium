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
import { GameReceive, GameSideAssigned } from '../main/game/store/game.actions';
import { TokenInfo } from '../../../../shared/lobby/tokenInfo';
import { Side } from '../../../../shared/engine/enums/side';
import { MoveInfo } from '../../../../shared/lobby/moveInfo';

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

  public createGame(gameName: string, gamePassword: string): void {
    this.socket.emit(SocketEvents.GAME, gameName, gamePassword);
  }

  public deleteGame(gameId: string, gamePassword: string): void {
    this.socket.emit(SocketEvents.DELETE, gameId, gamePassword);
  }

  public joinGame(joinInfo: JoinInfo): void {
    this.socket.on(this.getGameChannel(joinInfo.gameId), (data: any) => {
      const tokenInfo: TokenInfo = data as TokenInfo;

      if (tokenInfo && tokenInfo.token) {
        this.lobbyState.dispatch(LobbyGameJoined({ payload: tokenInfo }));
      } 
    });

    this.socket.emit(SocketEvents.JOIN, joinInfo);
  }

  public resumeGame(tokenInfo: TokenInfo): void {
    this.socket.on(this.getGameChannel(tokenInfo.gameId), (data: any) => {
      // I could not find a reliable way to determine the type of a json-object
      // So just try to cast and check if some properties are present
      // TODO: Maybe implement some IsValid-Methods to hide the details

      // Handle game message
      const game: Game = Game.clone(data as Game);

      if (game && game.board) {
        this.gameState.dispatch(GameReceive({ payload: game }));
      }

      // Handle side message
      const side: Side = data as Side;

      if (side === Side.Green || side === Side.Red) {
        this.gameState.dispatch(GameSideAssigned({ payload: side }));
      }
    });

    this.socket.emit(SocketEvents.RESUME, tokenInfo);
  }

  public move(moveInfo: MoveInfo): void {
    this.socket.emit(SocketEvents.MOVE, moveInfo);
  }

  private getGameChannel(gameId: string): string {
    return `${SocketEvents.GAME}${gameId}`;
  }
}
