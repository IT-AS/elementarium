import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'elementarium-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  private baseSize: number;

  public get headerWidth(): number {
    return this.baseSize * 0.9;
  }

  public get headerHeight(): number {
    return this.baseSize * 0.05;
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
