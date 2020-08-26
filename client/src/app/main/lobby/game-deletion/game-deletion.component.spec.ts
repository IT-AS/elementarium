import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GameDeletionComponent } from './game-deletion.component';
import { Store } from '@ngrx/store';

describe('GameDeletionComponent', () => {
  let component: GameDeletionComponent;
  let fixture: ComponentFixture<GameDeletionComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ GameDeletionComponent ],
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
    fixture = TestBed.createComponent(GameDeletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
