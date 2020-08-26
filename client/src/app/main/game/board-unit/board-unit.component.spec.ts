import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardUnitComponent } from './board-unit.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { InitialState } from '../store/game.reducer';

describe('BoardUnitComponent', () => {
  let component: BoardUnitComponent;
  let fixture: ComponentFixture<BoardUnitComponent>;
  let store: MockStore;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ BoardUnitComponent ],
      providers: [ provideMockStore({ initialState: InitialState }) ]
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoardUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
