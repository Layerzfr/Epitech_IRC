import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Message } from './message';
import {Observable, Observer} from "rxjs";
import {currentDoc} from "./channel-list/channel-list.component";
import {userName} from "./connexion/connexion.component";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  messageList:  string[] = [];
  constructor(private socket: Socket) { }
  public sendMessage(message) {
    // console.log(currentDoc);
    var messages = {
      id : currentDoc,
      message: message,
      username: userName
    };
    this.socket.emit('new-message', messages);
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
