import { Component, OnInit } from '@angular/core';

export let userName;

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    userName = prompt("Entrez votre pseudo !");
    console.log(userName)
  }

}
