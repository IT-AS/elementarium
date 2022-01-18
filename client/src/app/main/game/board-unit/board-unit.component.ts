import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import Unit from '../../../../../../shared/engine/unit';
import { Side } from '../../../../../../shared/engine/enums/side';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import GameState from '../store/game.reducer';
import { selectSide } from '../store/game.selector';

@Component({
  selector: 'app-board-unit',
  templateUrl: './board-unit.component.html',
  styleUrls: ['./board-unit.component.scss']
})
export class BoardUnitComponent implements OnInit {

  @Input()
  public unit: Unit;

  @Input()
  public relation: string = 'unit';

  @Input()
  public size: number;

  @Output()
  public draggi: EventEmitter<void> = new EventEmitter();

  public scale: number = 0.95;
  public side: Side;
  private side$: Observable<Side>;

  public get class(): string {
    if(this.unit) { return `${this.relation} ${this.unit.side} ${this.unit.type.toLowerCase()}` };

    return '';
  }

  public get image(): string {
    let side: string = '';

    if(this.unit) {
      if(this.unit.side === Side.Green) { side = 'order'; }
      if(this.unit.side === Side.Red) { side = 'chaos'; }

      return `/assets/${this.unit.type.toLowerCase()}-${side}.png`;
    }

    return '';
  }

  public get rotation(): string {
    if(this.side === Side.Red) {
      return 'rotate(180deg)'; 
    }

    return '';
  }

  private readonly iconName: string = 'drag-icon';

  constructor(private store: Store<GameState>) { 
    this.side$ = this.store.pipe(select(selectSide));
    this.side$.subscribe(side => {
      this.side = side as Side;
    });
  }

  ngOnInit(): void {
  }

  public onDragStart(event: DragEvent) {
    const img: HTMLImageElement = new Image(this.size, this.size);
    img.src = this.image;
    img.width = this.size;
    img.height = this.size;
    img.style.position = 'absolute';
    img.style.top = '-10000px';
    img.id = this.iconName;

    document.body.appendChild(img);
    event.dataTransfer.setDragImage(img, this.size/2, this.size/2);
    this.draggi.emit();  
  }

  public onDragEnd(event: DragEvent) {
    const img: HTMLImageElement = document.body.querySelector(`#${this.iconName}`);
    document.body.removeChild(img);
  }
}
