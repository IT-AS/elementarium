import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: any;

  constructor() {   }

  setupSocketConnection() {
    this.socket = io(environment.world);
    this.socket.emit('games');

    this.socket.on('games', (data: string) => {
      console.log(data);
    });
  }
}
