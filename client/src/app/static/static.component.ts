import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-static',
  templateUrl: './static.component.html',
  styleUrls: ['./static.component.scss']
})
export class StaticComponent implements OnInit {
  
  private baseSize: number;

  public currentRoute: string;

  public get boxHeight(): number {
    return window.innerHeight * 0.9;
  }

  public get boxWidth(): number {
    return this.baseSize * 0.9;
  }

  constructor(private router: Router) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(x => this.currentRoute = (<NavigationEnd>x).url);
    this.getScreenSize();
  }

  ngOnInit(): void {
  }

  
  @HostListener('window:resize', ['$event'])
  private getScreenSize(event?) {
    this.baseSize = Math.min(window.innerHeight, window.innerWidth);
  }
}
