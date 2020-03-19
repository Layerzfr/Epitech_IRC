import { Component, OnInit } from '@angular/core';
import {ChatService} from "../chat.service";

export let userName;

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    userName = prompt("Entrez votre pseudo !");
    this.chatService.sendMessage(userName + ' is now connected ');
    console.log(userName)
  }

}
