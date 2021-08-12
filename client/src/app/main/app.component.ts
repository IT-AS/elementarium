import {Component} from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'elementarium-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'elementarium-client';

  constructor(private socketService: SocketService, private navigationService: NavigationService) {}
  
  ngOnInit() {
    this.socketService.initialize();
    this.navigationService.initialize();
  }  
}
