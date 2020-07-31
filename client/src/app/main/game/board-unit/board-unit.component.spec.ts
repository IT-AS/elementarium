import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardUnitComponent } from './board-unit.component';

describe('BoardUnitComponent', () => {
  let component: BoardUnitComponent;
  let fixture: ComponentFixture<BoardUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoardUnitComponent ]
    })
    .compileComponents();
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
