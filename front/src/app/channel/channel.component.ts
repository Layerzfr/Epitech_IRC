import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {Channel} from "../models/channel";
import {ChannelService} from "../channel.service";

@Component({
  selector: 'app-document',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss']
})
export class ChannelComponent implements OnInit, OnDestroy {
  channel: Channel | { channel: string; id: string };
  private _docSub: Subscription;
  constructor(private channelService: ChannelService) { }

  ngOnInit() {
    this._docSub = this.channelService.currentDocument.pipe(
      startWith({ id: '', channel: 'Selectionner un channel existant ou créer un nouveau channel'})
    ).subscribe(document => this.channel = document);
  }

  ngOnDestroy() {
    this._docSub.unsubscribe();
  }

  editDoc(event) {
    if (event.key === "Enter") {
      this.channelService.editDocument(this.channel);
    }
  }
}
