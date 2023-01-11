import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'elementarium-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  private baseSize: number;

  public get footerWidth(): number {
    return this.baseSize * 0.9;
  }

  public get footerHeight(): number {
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
