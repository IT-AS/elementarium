import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import Game from '../../../../../shared/engine/game';
import { Observable } from 'rxjs';
import GameState from './store/game.reducer';
import { selectGame } from './store/game.selector';
import { Router } from '@angular/router';
import { TokenInfo } from '../../../../../shared/lobby/tokenInfo';
import { GameResume } from './store/game.actions';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public game: Game;
  private subscription$: Observable<Game>;

  constructor(
    private store: Store<GameState>,
    private router: Router) { 

      this.subscription$ = this.store.pipe(select(selectGame));
      this.subscription$.subscribe(game => {
        this.game = game as Game;
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
