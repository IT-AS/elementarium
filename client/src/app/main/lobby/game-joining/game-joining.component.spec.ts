import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameJoiningComponent } from './game-joining.component';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

describe('GameJoiningComponent', () => {
  let component: GameJoiningComponent;
  let fixture: ComponentFixture<GameJoiningComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ GameJoiningComponent ],
      providers: [
        {
          provide: Store,
          useValue: provideMockStore
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameJoiningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
