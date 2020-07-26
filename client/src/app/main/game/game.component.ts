import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import Game from '../../../../../shared/engine/game';
import { Observable } from 'rxjs';
import GameState from './store/game.reducer';
import { selectGame } from './store/game.selector';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  public game: Game;
  private subscription$: Observable<Game>;

  constructor(
    private store: Store<GameState>) { 

      this.subscription$ = this.store.pipe(select(selectGame));
      this.subscription$.subscribe(game => {
        this.game = game;
      });
  }

  ngOnInit(): void {
  }
}
