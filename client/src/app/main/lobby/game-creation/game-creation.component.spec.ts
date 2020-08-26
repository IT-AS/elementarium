import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCreationComponent } from './game-creation.component';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

describe('GameCreationComponent', () => {
  let component: GameCreationComponent;
  let fixture: ComponentFixture<GameCreationComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ GameCreationComponent ],
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
    fixture = TestBed.createComponent(GameCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
