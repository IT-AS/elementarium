import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import Game from '../../../../../shared/engine/game';
import { Observable } from 'rxjs';
import GameState from './store/game.reducer';
import { selectGame, selectSide, selectHistory } from './store/game.selector';
import { Router } from '@angular/router';
import { TokenInfo } from '../../../../../shared/lobby/tokenInfo';
import { GameResume, GameMove, FieldMoveUndo } from './store/game.actions';
import { Side } from '../../../../../shared/engine/enums/side';
import { MoveInfo } from '../../../../../shared/lobby/moveInfo';
import Move from '../../../../../shared/engine/moves/move';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public game: Game;
  public side: Side;
  public history: Move[];
  private game$: Observable<Game>;
  private side$: Observable<Side>;
  private history$: Observable<Move[]>;

  private tokenInfo: TokenInfo;
  private afterGame: boolean = false;

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

  public get finished(): boolean {
    return this.game?.winner && !this.afterGame;
  }

  constructor(
    private store: Store<GameState>,
    private router: Router) { 

      this.game$ = this.store.pipe(select(selectGame));
      this.game$.subscribe(game => {
        this.game = Game.clone(game);
      });

      this.side$ = this.store.pipe(select(selectSide));
      this.side$.subscribe(side => {
        this.side = side as Side;
      });

      this.history$ = this.store.pipe(select(selectHistory));
      this.history$.subscribe(history => {
        this.history = history as Move[];
      });
   }

  ngOnInit(): void {
    const url: string[] = this.router.url.split('/');

    if(url.length >= 4 && url[1] === 'game') {
      this.tokenInfo = { gameId: url[2], token: url[3] };
      this.store.dispatch(GameResume({payload: this.tokenInfo}));
    }
  }

  public submit(): void {
    const moveInfo: MoveInfo = { 
      gameId: this.game.gameId,
      moves: this.history,
      token: this.tokenInfo.token
    };

    this.store.dispatch(GameMove({payload: moveInfo}));
  }

  public undo(): void {
    this.store.dispatch(FieldMoveUndo());
  }

  public retreat(): void {

  }

  public quit(): void {
    this.router.navigate(['/']);
  }

  public close(): void {
    this.afterGame = true;
  }
}