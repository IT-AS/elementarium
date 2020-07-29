import { Component, OnInit, Input } from '@angular/core';
import Field from '../../../../../../shared/engine/field';
import Unit from '../../../../../../shared/engine/unit';

@Component({
  selector: 'app-board-cell',
  templateUrl: './board-cell.component.html',
  styleUrls: ['./board-cell.component.scss']
})
export class BoardCellComponent implements OnInit {

  @Input()
  public field: Field

  public fullField: Field;

  constructor() { }

  ngOnInit(): void {
    this.fullField = new Field(this.field.row, this.field.column);
    if(this.field.current) {
      this.fullField.current = new Unit(this.field.current.type, this.field.current.side);
    }
  }
}
