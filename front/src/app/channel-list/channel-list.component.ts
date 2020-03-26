import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import {ChannelService} from "../channel.service";
import {userName} from "../connexion/connexion.component";

export let currentDoc: string;

@Component({
  selector: 'app-document-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  documents: Observable<string[]>;
  currentDoc$: string;
  bool: any;
  isChecked: number = 0;
  private _docSub: Subscription;

  constructor(private channelService: ChannelService) { }

  ngOnInit() {
    this.documents = this.channelService.documents;
    this._docSub = this.channelService.currentDocument.subscribe(doc => this.currentDoc$ = doc.id);
    currentDoc = this.currentDoc$;
  }

  ngOnDestroy() {
    this._docSub.unsubscribe();
  }

  loadDoc(id: string) {
    console.log(id);
    currentDoc = id;
    this.channelService.getDocument(id);
  }

  editDoc(id: string, newId) {
    console.log(id);
    currentDoc = id;
    this.channelService.editDocument(id, newId.target.value);
  }

  newDoc() {
    this.channelService.newDocument();
  }

  checkBox(DocId) {
    this.bool = document.getElementById(DocId);
    if (this.bool.checked == true) {
      this.isChecked = 1 ;
      this.channelService.join(DocId, userName)
    } else {
      this.channelService.leave(DocId, userName)
      this.isChecked = 0
    }
  }

}
