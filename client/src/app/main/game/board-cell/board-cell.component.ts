import { Component, OnInit, Input } from '@angular/core';
import Field from '../../../../../../shared/engine/field';

@Component({
  selector: 'app-board-cell',
  templateUrl: './board-cell.component.html',
  styleUrls: ['./board-cell.component.scss']
})
export class BoardCellComponent implements OnInit {

  @Input()
  public field: Field

  constructor() { }

  ngOnInit(): void {
  }

}
