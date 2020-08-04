import { Component, OnInit, Input } from '@angular/core';
import Field from '../../../../../../shared/engine/field';
import { Side } from '../../../../../../shared/engine/enums/side';
import { Store, select } from '@ngrx/store';
import GameState from '../store/game.reducer';
import { FieldDeactivate, FieldActivate, FieldMoveHere } from '../store/game.actions';
import { Observable } from 'rxjs';
import { selectSelectedField, selectSide } from '../store/game.selector';
import Unit from '../../../../../../shared/engine/unit';

@Component({
  selector: 'app-board-cell',
  templateUrl: './board-cell.component.html',
  styleUrls: ['./board-cell.component.scss']
})
export class BoardCellComponent implements OnInit {

  @Input()
  public field: Field
  public selectedField: Field;

  @Input()
  public size: number;

  public Side = Side;
  public get side(): Side {
    return this.field.territory();
  }

  public get candidate(): Unit {
    let side: Side;
    this.store.select(selectSide).subscribe(s => side = s); // NgRx why you do this to me?!

    return this.field?.candidate(side)
  }

  private selectedField$: Observable<Field>;

  constructor(private store: Store<GameState>) { 
    this.selectedField$ = this.store.pipe(select(selectSelectedField));
    this.selectedField$.subscribe(selectedField => {
      this.selectedField = selectedField;
    });
  }

  ngOnInit(): void {
  }

  public onClick(event) {
    if(this.selectedField) {
      if(this.field?.moveHere) {
        this.store.dispatch(FieldMoveHere({payload: this.field}));
      } 
      this.store.dispatch(FieldDeactivate({payload: this.field}));
    } else {
      if(!this.field?.empty()) {
        this.store.dispatch(FieldDeactivate({payload: this.field}));
        this.store.dispatch(FieldActivate({payload: this.field}));
      }
    }
  }
}
