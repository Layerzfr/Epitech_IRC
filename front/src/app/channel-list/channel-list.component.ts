import {ConnexionComponent, userName} from "../connexion/connexion.component";
import {Component, OnInit, OnDestroy} from '@angular/core';

import {Observable, Subscription} from 'rxjs';
import {ChannelService} from "../channel.service";

export let currentDoc: string;

@Component({
    selector: 'app-document-list',
    templateUrl: './channel-list.component.html',
    styleUrls: ['./channel-list.component.scss']
})

export class ChannelListComponent implements OnInit, OnDestroy {
    documents: Observable<{}[]>;
    currentDoc$: string;
    bool: any;
    isChecked: number = 0;
    hex: any = '#';
    newHex: any = '#';
    id: any;
    colors = {};
    private _docSub: Subscription;
    username= userName;

    constructor(private channelService: ChannelService, private connexionComponent: ConnexionComponent) {
    }

    ngOnInit() {
        this.documents = this.channelService.documents;
        this._docSub = this.channelService.currentDocument.subscribe(doc => this.currentDoc$ = doc.id);
        currentDoc = this.currentDoc$;
    }

    getUsername()
    {
      return userName;
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

  editColorDoc(id: string, color) {
    this.channelService.editColor(id, color);
  }

  deleteDoc(id: string) {
    this.channelService.deleteDocument(id);
  }

    newDoc() {
        this.channelService.newDocument();
    }

    generateHex(channel:any) {
      let hex = '#';
        if (!this.colors[channel]) {
          console.log(hex);
          let length = 6;
          let chars = '0123456789ABCDEF';
          while (length--) {
              hex += chars[(Math.random() * 16) | 0];
          }
          this.colors[channel] = hex;
        }
        return this.colors[channel];
    }

  checkBox(DocId) {
    this.bool = document.getElementById(DocId);
    if (this.bool.checked == true) {
      this.isChecked = 1;
      this.channelService.join(DocId, userName)
    } else {
      this.channelService.leave(DocId, userName);
      this.isChecked = 0
    }
    if (DocId == 'general') {
        this.isChecked = 1;
    }
  }


    dynamicStyles() {

    }

}
