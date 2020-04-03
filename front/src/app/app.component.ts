import {Component, AfterViewChecked, ElementRef, ViewChild, OnInit} from '@angular/core';
import {ChatService} from './chat.service';
import {userName} from "./connexion/connexion.component";
import {message} from "./channel-list/channel-list.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  [x: string]: any;

  newMessage: string;
  messageList: string[] = [];
  userList: string[] = [];
  textinput: any = null;
  pseudoUser:any = ' ';

  constructor(private chatService: ChatService) {
  }

  sendMessage() {
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
    this.pseudoUser = ' ';
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

  getUsername() {
    return userName;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  messageHolder() {
    if (this.pseudoUser == ' ') {
      this.textinput = message;
      return '/' + this.textinput;
    } else {
      return '/mp ' + this.pseudoUser + ' ';
    }
  }

  sendPrivate(pseudo:any) {
    this.pseudoUser = pseudo;
  }
}
