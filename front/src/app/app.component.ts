import {Component, OnInit} from '@angular/core';
import { ChatService } from './chat.service';
import {userName} from "./connexion/connexion.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    [x: string]: any;
  newMessage: string;
  messageList:  string[] = [];

  constructor(private chatService: ChatService) {
  }

  sendMessage() {
    this.chatService.sendMessage(userName + ': ' + this.newMessage);
    this.newMessage = '';
  }
  ngOnInit() {
    this.chatService
      .getMessages()
      .subscribe((message: string) => {
        this.messageList.push(message);
      });
  }
}
