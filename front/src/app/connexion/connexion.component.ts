import {Component, OnInit} from '@angular/core';
import {ChatService} from "../chat.service";
import {Observable} from "rxjs";

export let userName = null;
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {
  public value: string;
  public bool: boolean;

  constructor(private chatService: ChatService) {
    this.bool = true;
    this.value = "test";
  }

  ngOnInit(): void {
  }

  onEnter(value) {
    this.value = value.target.value;
    this.bool = false;
    userName = this.value;
    this.chatService.newConnection(userName);
  }

}
