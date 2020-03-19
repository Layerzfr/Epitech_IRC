import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import {ChannelService} from "../channel.service";

export let currentDoc: string;

@Component({
  selector: 'app-document-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  documents: Observable<string[]>;
  currentDoc$: string;
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

  newDoc() {
    this.channelService.newDocument();
  }

}
