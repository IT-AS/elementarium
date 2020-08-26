import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameListComponent } from './game-list.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { InitialState } from '../store/lobby.reducer';

describe('GameListComponent', () => {
  let component: GameListComponent;
  let fixture: ComponentFixture<GameListComponent>;
  let store: MockStore;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ GameListComponent ],
      providers: [ provideMockStore({ initialState: InitialState }) ]
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
