import { TestBed } from '@angular/core/testing';

import { SocketService } from './socket.service';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store,
          useValue: provideMockStore
        }
      ]
    });
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
