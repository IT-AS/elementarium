import { Component, OnInit, Input } from '@angular/core';
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

  public scale: number = 0.6;

  public get class(): string {
    return `unit ${this.unit.side} ${this.unit.type.toLowerCase()}`;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
