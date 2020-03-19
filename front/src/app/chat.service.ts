import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Message } from './message';
import {Observable, Observer} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageList:  string[] = [];
  constructor(private socket: Socket) { }
  public sendMessage(message) {
    this.socket.emit('new-message', message);
  }
  public getMessages = () => {
    return new Observable((observer: Observer<any>) => {
      this.socket.on('new-message', (message) => {
        this.messageList.push(message);
        observer.next(message);
      });
      // observer.next();
      // observer.complete();
    });

  }
}
