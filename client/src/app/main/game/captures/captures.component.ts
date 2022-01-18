import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Turn } from '../../../../../../shared/engine/moves/turn';

@Component({
  selector: 'app-captures',
  templateUrl: './captures.component.html',
  styleUrls: ['./captures.component.scss']
})
export class CapturesComponent implements OnInit {

  @Input()
  public turn: Turn;
  @Input()
  public dimension: number;

  private baseSize: number;

  public get size(): number {
    return this.baseSize * 0.9 / this.dimension - 1;
  }

  public get any(): boolean {
    return (this.turn?.green?.captures?.length + this.turn?.red?.captures?.length) > 0;
  }


  constructor() { 
    this.getScreenSize();
  }

  ngOnInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  private getScreenSize(event?) {
    this.baseSize = Math.min(window.innerHeight, window.innerWidth);
  }
}
