import { Injectable } from "@angular/core";
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TokenInfo } from "../../../../shared/lobby/tokenInfo";
import { Store } from '@ngrx/store';
import GameState from "../main/game/store/game.reducer";
import { TokenChanged } from "../main/game/store/game.actions";

@Injectable({
  providedIn: 'root',
})

export class NavigationService {

  constructor(private store: Store<GameState>, private router: Router) {}

  public initialize(): void {
    this.router.events
    .subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.extractTokenFromUri(event.url);
      }
    });
  }

  private extractTokenFromUri(url: string) {
    const urlInfo: string[] = url.split('/');

    if(urlInfo?.length >= 4 && urlInfo[1] === 'game') {
      const tokenInfo = <TokenInfo>{ gameId: urlInfo[2], token: urlInfo[3] };
      this.store.dispatch(TokenChanged({payload: tokenInfo}));
    }
  }
}
