import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import Unit from '../../../../../../shared/engine/unit';

@Component({
  selector: 'app-board-unit',
  templateUrl: './board-unit.component.html',
  styleUrls: ['./board-unit.component.scss']
})
export class BoardUnitComponent implements OnInit {

  @Input()
  public unit: Unit;

  @Input()
  public size: number;

  @Output()
  public drag: EventEmitter<void> = new EventEmitter();

  public scale: number = 0.95;

  public get class(): string {
    return `unit ${this.unit.side} ${this.unit.type.toLowerCase()}`;
  }

  constructor() { }

  ngOnInit(): void {
  }

  public onDrag(event) {
    this.drag.emit();
  }
}
