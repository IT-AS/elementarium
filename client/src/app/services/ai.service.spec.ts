import { TestBed } from '@angular/core/testing';

import { AiService } from './ai.service';
import Game from '../../../../shared/engine/game';

fdescribe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be tested', () => {
    const game: Game = new Game('123', '123');
    game.start();

    const moves = service.next(game.board);
    expect(moves).toBeFalsy();
  })
});
