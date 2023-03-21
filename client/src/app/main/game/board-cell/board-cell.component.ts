import { Component, OnInit, Input } from '@angular/core';
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

  public get rotation(): string {
    if(this.side === Side.Red) {
      return 'rotate(180deg)'; 
    }

    return '';
  }

  public get unitRelation(): string {
    return this.candidate ? 'unit-under-candidate' : 'unit';
  }

  public get candidateRelation(): string {
    return this.field?.current ? 'candidate-over-unit' : 'candidate';
  }

  public get targetTranslation(): string {
    if (!this.field?.current && !this.candidate) {
      return 'translate(150%, 150%)';
    } else if (this.field?.current && !this.candidate) {
      return 'translate(150%, -235%)';
    } else if (!this.field?.current && this.candidate) {
      return 'translate(150%, -50%)';
    }

    return '';
  }

  public get background(): string {
    const max: number = 10;
    let background: string = '';

    if (this.field?.row === 0) { 
      if (this.field?.column === 0) {
        background = 'top-left';
      } else if (this.field?.column === max) {
        background = 'top-right';
      } else {
        background = 'top';
      }
    } else if (this.field?.row === max) {
      if (this.field?.column === 0) {
        background = 'bot-left';
      } else if (this.field?.column === max) {
        background = 'bot-right';
      } else {
        background = 'bot';
      }
    } else if (this.field?.column === 0) {
      background = 'left';
    } else if (this.field?.column === max) {
      background = 'right';
    } else {
      background = 'cell';
    }

    return `url(/assets/${background}.png)`;
  }

  private lastMove$: Observable<{ from: Field, to: Field }>;
  private selectedField$: Observable<Field>;
  private targets$: Observable<number[][]>;

  constructor(private store: Store<GameState>) { }

  ngOnInit(): void {
    this.selectedField$ = this.store.pipe(select(selectSelectedField));
    this.selectedField$?.subscribe(selectedField => {
      this.selectedField = selectedField;
    });

    this.targets$ = this.store.pipe(select(selectTargets));
    this.targets$?.subscribe(targets => this.filterTargets(targets));

    this.lastMove$ = this.store.pipe(select(selectLastMove));
    this.lastMove$?.subscribe(lastMove => this.performMove(lastMove));
  }

  public onClick(event) {
    this.activateFields();
  }

  public onDrag() {
    this.activateFields();
  }

  public onDrop(event) {
    this.activateFields();
    event.preventDefault();
  }

  public allowDrop(event) {
    event.preventDefault();
  }

  private activateFields(): void {
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

  private filterTargets(targets: number[][]): void {
    if(targets?.length > 0) {
      const target = targets.filter(target => this.field?.row === target[0] && this.field?.column === target[1]);
      if(target?.length > 0 && !this.field.candidate(this.side)) {
        this.isTarget = true;
      }
    } else {
      this.isTarget = false;
    }
  }

  private performMove(lastMove): void {
    if( this.field && lastMove?.to && lastMove?.from ) {
      if(lastMove.to.row === this.field.row && lastMove.to.column === this.field.column) {
        const newField = Field.clone(this.field);
        if (lastMove.from.current) {
          if (this.side === Side.Green) { 
            newField.greenCandidate = lastMove.from.current;
          }
          if (this.side === Side.Red) { 
            newField.redCandidate = lastMove.from.current; 
          }
        } else {
          newField.current = lastMove.from.candidate(this.side);
        }
        this.field = newField;
      }

      if(lastMove.from.row === this.field.row && lastMove.from.column === this.field.column) {
        const newField = Field.clone(this.field);
        if(newField.current?.side === this.side) { 
          newField.current = null; 
        } else {
          newField.greenCandidate = null;
          newField.redCandidate = null;
        }
        this.field = newField;
      }
    }
  }
}
