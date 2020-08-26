import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardCellComponent } from './board-cell.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { InitialState } from '../store/game.reducer';

describe('BoardCellComponent', () => {
  let component: BoardCellComponent;
  let fixture: ComponentFixture<BoardCellComponent>;
  let store: MockStore;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ BoardCellComponent ],
      providers: [ provideMockStore({ initialState: InitialState }) ]
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
