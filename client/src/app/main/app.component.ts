import {Component} from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'elementarium-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'elementarium-client';

  constructor(private socketService: SocketService) {}
  
  ngOnInit() {
    this.socketService.initialize();
  }  
}
