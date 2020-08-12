import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import Field from '../../../../../../shared/engine/field';
import { Side } from '../../../../../../shared/engine/enums/side';
import { Store, select } from '@ngrx/store';
import GameState from '../store/game.reducer';
import { FieldDeactivate, FieldActivate, FieldMoveHere } from '../store/game.actions';
import { Observable } from 'rxjs';
import { selectSelectedField, selectTargets, selectLastMove } from '../store/game.selector';
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
  public isTarget: boolean;

  @Input()
  public size: number;

  @Input()
  public side: Side;

  public Side = Side;
  public get territory(): Side {
    return this.field?.territory();
  }

  public get candidate(): Unit {
    return this.field?.candidate(this.side)
  }

  private lastMove$: Observable<{ from: Field, to: Field }>;
  private selectedField$: Observable<Field>;
  private targets$: Observable<number[][]>;

  constructor(private store: Store<GameState>) { }

  ngOnInit(): void {
    this.selectedField$ = this.store.pipe(select(selectSelectedField));
    this.selectedField$.subscribe(selectedField => {
      this.selectedField = selectedField;
    });

    this.targets$ = this.store.pipe(select(selectTargets));
    this.targets$.subscribe(targets => {
      if(targets.length > 0) {
        const target = targets.filter(target => this.field?.row === target[0] && this.field?.column === target[1]);
        if(target.length > 0) {
          this.isTarget = true;
        }
      } else {
        this.isTarget = false;
      }
    });

    this.lastMove$ = this.store.pipe(select(selectLastMove));
    this.lastMove$.subscribe(lastMove => {
      if( this.field && lastMove?.to && lastMove?.from ) {
        if(lastMove.to.row === this.field.row && lastMove.to.column === this.field.column) {
          const newField = Field.clone(this.field);
          if (this.side === Side.Green) { 
            newField.greenCandidate = lastMove.from.current;
          }
          if (this.side === Side.Red) { 
            newField.redCandidate = lastMove.from.current; 
          }
          this.field = newField;
        }

        if(lastMove.from.row === this.field.row && lastMove.from.column === this.field.column) {
          const newField = Field.clone(this.field);
          newField.current = null;
          this.field = newField;
        }
      }
    });
  }

  public onClick(event) {
    this.activate();
  }

  public onDrag() {
    this.activate();
  }

  public onDrop(event) {
    this.activate();
    event.preventDefault();
  }

  public allowDrop(event) {
    event.preventDefault();
  }

  private activate() {
    if(this.selectedField && this.isTarget) {
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
