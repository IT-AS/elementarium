import { Component, OnInit, Input } from '@angular/core';
import Field from '../../../../../../shared/engine/field';
import { Side } from '../../../../../../shared/engine/enums/side';

@Component({
  selector: 'app-board-cell',
  templateUrl: './board-cell.component.html',
  styleUrls: ['./board-cell.component.scss']
})
export class BoardCellComponent implements OnInit {

  @Input()
  public field: Field

  @Input()
  public size: number;

  public Side = Side;

  public get side(): Side {
    return this.field.territory();
  }

  constructor() { }

  ngOnInit(): void {
  }
}
