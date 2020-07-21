import { Component, OnInit, OnChanges, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-game-creation',
  templateUrl: './game-creation.component.html',
  styleUrls: ['./game-creation.component.scss']
})
export class GameCreationComponent implements OnInit {

  @Input()
  public visible: boolean;
  public visibility: string;

  @Output()
  public closing = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.visibility = this.visible ? "show" : "hidden";
  }

  public close(): void {
    this.closing.emit();
  }
}
