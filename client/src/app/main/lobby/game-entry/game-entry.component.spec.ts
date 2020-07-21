import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEntryComponent } from './game-entry.component';

describe('GameEntryComponent', () => {
  let component: GameEntryComponent;
  let fixture: ComponentFixture<GameEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameEntryComponent ]
    })
    .compileComponents();
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
