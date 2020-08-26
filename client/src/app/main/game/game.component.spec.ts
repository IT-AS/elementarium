import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { InitialState } from './store/game.reducer';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let router: Router;
  let store: MockStore;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [ GameComponent ],
      providers: [ provideMockStore({ initialState: InitialState }) ]
    })
    .compileComponents();

    store = TestBed.inject(MockStore);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
