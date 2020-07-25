import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameJoiningComponent } from './game-joining.component';

describe('GameJoiningComponent', () => {
  let component: GameJoiningComponent;
  let fixture: ComponentFixture<GameJoiningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameJoiningComponent ]
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
