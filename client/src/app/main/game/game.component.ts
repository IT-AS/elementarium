import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import Game from '../../../../../shared/engine/game';
import { Observable } from 'rxjs';
import GameState from './store/game.reducer';
import { selectGame, selectSide, selectHistory, selectTokenInfo } from './store/game.selector';
import { Router } from '@angular/router';
import { TokenInfo } from '../../../../../shared/lobby/tokeninfo';
import { GameResume, GameMove, FieldMoveUndo, FieldDeactivate, GameSurrender } from './store/game.actions';
import { Side } from '../../../../../shared/engine/enums/side';
import { MoveInfo } from '../../../../../shared/lobby/moveinfo';
import Move from '../../../../../shared/engine/moves/move';
import { Turn } from '../../../../../shared/engine/moves/turn';
import { AiService } from 'src/app/services/ai.service';
import Rules from '../../../../../shared/engine/rules';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  public game: Game;
  public side: Side;
  public history: Move[];
  public tokenInfo: TokenInfo;
  private game$: Observable<Game>;
  private side$: Observable<Side>;
  private history$: Observable<Move[]>;
  private tokenInfo$: Observable<TokenInfo>;

  private afterGame: boolean = false;
  private clientWaiting: boolean = false;

  public get outcome(): string {
    if(this.game?.winner === Side.Red) {
      return 'Chaos always defeats order, because it is better organized...';
    } 
    
    if (this.game?.winner === Side.Green) {
      return 'Nobody can escape from the triumph of Order!';
    }

    if (this.game?.winner === Side.Gray) {
      return 'Order and Chaos will forever remain in equilibrium!';
    }

    return '';
  }

  public get waiting(): boolean {
    if(this.game?.journal.length <= 0) {return this.clientWaiting; }

    const turn: Turn = this.game?.journal[this.game.turn - 1];

    if(!turn) { return this.clientWaiting; }

    return (this.side === Side.Green && turn.green !== null && !turn.red) ||
           (this.side === Side.Red && !turn.green && turn.red !== null) ||
           this.clientWaiting;
  }

  public get finished(): boolean {
    return this.game?.winner && !this.afterGame;
  }

  constructor(
    private store: Store<GameState>,
    private router: Router,
    private aiService: AiService) { 

    this.game$ = this.store.pipe(select(selectGame));
    this.game$?.subscribe(game => {
      this.game = Game.clone(game);
      this.clientWaiting = false;
    });

    this.side$ = this.store.pipe(select(selectSide));
    this.side$?.subscribe(side => {
      this.side = side as Side;
    });

    this.history$ = this.store.pipe(select(selectHistory));
    this.history$?.subscribe(history => {
      this.history = history as Move[];
    });

    this.tokenInfo$ = this.store.pipe(select(selectTokenInfo));
    this.tokenInfo$?.subscribe(tokenInfo => {
      this.tokenInfo = tokenInfo;
      
      if(tokenInfo?.gameId && tokenInfo?.token) {
        this.store.dispatch(GameResume({payload: tokenInfo}));
      }
    });
  }

  public submit(): void {
    const moveInfo: MoveInfo = { 
      gameId: this.game.gameId,
      moves: this.history,
      token: this.tokenInfo.token,
      ai: this.aiService.next(this.game.board, this.game.movesPerTurn, Rules.opponent(this.side))
    };

    this.clientWaiting = true;

    this.store.dispatch(GameMove({payload: moveInfo}));
  }

  public undo(): void {
    this.store.dispatch(FieldMoveUndo());
    this.store.dispatch(FieldDeactivate({payload: null}));
  }

  public surrender(): void {
    this.store.dispatch(GameSurrender({payload: this.tokenInfo}));
  }

  public quit(): void {
    this.router.navigate(['/']);
  }

  public close(): void {
    this.afterGame = true;
  }
}
