import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';

import {ChannelService} from "../channel.service";
import {userName} from '../connexion/connexion.component';

@Component({
  selector: 'app-document-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, OnDestroy {
  documents: Observable<string[]>;
  currentDoc: string;
  private _docSub: Subscription;

  constructor(private channelService: ChannelService) {
  }

  ngOnInit() {
    this.documents = this.channelService.documents;
    this._docSub = this.channelService.currentDocument.subscribe(doc => this.currentDoc = doc.id);
  }

  ngOnDestroy() {
    this._docSub.unsubscribe();
  }

  pseudoMessage(id: string) {
    if (userName === "Damien") {
      console.log("OK TA MERE !")
    } else {
      this.channelService.getDocument(id);
    }
  }

  /*loadDoc(id: string) {
    this.channelService.getDocument(id);
  }*/

  newDoc() {
    this.channelService.newDocument();
  }

}
