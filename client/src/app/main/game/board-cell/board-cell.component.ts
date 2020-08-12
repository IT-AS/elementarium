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

  @Input()
  public side: Side;

  public Side = Side;
  public get territory(): Side {
    return this.field.territory();
  }

  public get candidate(): Unit {
    return this.field?.candidate(this.side)
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
    this.activate();
  }

  public onDrag() {
    this.activate();
  }

  public onDrop(event) {
    this.activate();

    const img: HTMLImageElement = document.body.querySelector('#drag-icon');
    document.body.removeChild(img);
    event.preventDefault();
  }

  public allowDrop(event) {
    event.preventDefault();
  }

  private activate() {
    if(this.selectedField && this.field?.moveHere) {
        this.store.dispatch(FieldMoveHere({payload: this.field}));
        this.store.dispatch(FieldDeactivate({payload: this.field}));
    } else {
      this.store.dispatch(FieldDeactivate({payload: this.field}));
      if(!this.field?.empty()) {
        this.store.dispatch(FieldActivate({payload: this.field}));
      }
    }
  }
}
