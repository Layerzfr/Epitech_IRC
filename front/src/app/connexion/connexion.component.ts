import {Component, OnInit} from '@angular/core';
import {ChatService} from "../chat.service";

export let userName = null;

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {
  public value: string;
  public bool: boolean;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
  }

  onEnter(value) {
    this.value = value.target.value;
    userName = this.value;
    console.log(userName)
  }

}
