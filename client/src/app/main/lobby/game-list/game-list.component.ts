import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectGames } from 'src/app/main/lobby/store/lobby.selector';
import { GameInfo } from '../../../../../../shared/lobby/gameinfo';
import { Observable } from 'rxjs';
import { LobbyGamesGet } from '../store/lobby.actions';
import LobbyState from 'src/app/main/lobby/store/lobby.state';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  public games: GameInfo[];
  private subscription$: Observable<GameInfo[]>;

  constructor(
    private store: Store<LobbyState>) { 

      this.subscription$ = this.store.pipe(select(selectGames));
      this.subscription$.subscribe(games => {
        this.games = games;
        console.log(this.games);
      });
  }

  ngOnInit(): void {
    this.store.dispatch(LobbyGamesGet());
  }
}
