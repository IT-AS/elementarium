import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEntryComponent } from './game-entry.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { InitialState } from '../store/lobby.reducer';

describe('GameEntryComponent', () => {
  let component: GameEntryComponent;
  let fixture: ComponentFixture<GameEntryComponent>;
  let store: MockStore;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ GameEntryComponent ],
      providers: [ provideMockStore({ initialState: InitialState }) ]
    })
    .compileComponents();
    
    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
