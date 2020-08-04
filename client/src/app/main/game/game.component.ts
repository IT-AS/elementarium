import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import Game from '../../../../../shared/engine/game';
import { Observable } from 'rxjs';
import GameState from './store/game.reducer';
import { selectGame, selectSide } from './store/game.selector';
import { Router } from '@angular/router';
import { TokenInfo } from '../../../../../shared/lobby/tokenInfo';
import { GameResume } from './store/game.actions';
import { Side } from '../../../../../shared/engine/enums/side';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public game: Game;
  public side: Side;
  private game$: Observable<Game>;
  private side$: Observable<Side>;

  constructor(
    private store: Store<GameState>,
    private router: Router) { 

      this.game$ = this.store.pipe(select(selectGame));
      this.game$.subscribe(game => {
        this.game = game as Game;
      });

      this.side$ = this.store.pipe(select(selectSide));
      this.side$.subscribe(side => {
        this.side = side as Side;
      });
   }

  ngOnInit(): void {
    const url: string[] = this.router.url.split('/');

    if(url.length >= 4 && url[1] === 'game') {
      const tokenInfo: TokenInfo = { gameId: url[2], token: url[3] };
      this.store.dispatch(GameResume({payload: tokenInfo}));
    }
  }
}
