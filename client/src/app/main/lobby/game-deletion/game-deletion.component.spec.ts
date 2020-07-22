import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDeletionComponent } from './game-deletion.component';

describe('GameDeletionComponent', () => {
  let component: GameDeletionComponent;
  let fixture: ComponentFixture<GameDeletionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameDeletionComponent ]
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
