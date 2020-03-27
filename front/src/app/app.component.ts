import {Component, AfterViewChecked, ElementRef, ViewChild, OnInit} from '@angular/core';
import { ChatService } from './chat.service';
import {userName} from "./connexion/connexion.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked{

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    [x: string]: any;
  newMessage: string;
  messageList:  string[] = [];
  userList:  string[] = [];

  constructor(private chatService: ChatService) {
  }

  sendMessage() {
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
  }
  ngOnInit() {
    this.scrollToBottom();
    this.chatService
      .getUsersList()
      .subscribe((user: string) => {
        let test = [user];
        this.userList = test;
      });
    this.chatService
      .getMessages()
      .subscribe((message: string) => {
        this.messageList.push(message);
      });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
