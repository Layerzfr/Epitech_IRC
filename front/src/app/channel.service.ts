import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import {Channel} from "./models/channel";
import {userName} from "./connexion/connexion.component";

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  currentDocument = this.socket.fromEvent<Channel>('document');
  documents = this.socket.fromEvent<{}[]>('documents');

  constructor(private socket: Socket) { }

  getDocument(id: string) {
    this.socket.emit('getDoc', id);
  }

  newDocument() {
    this.socket.emit('addDoc', { id: this.docId(), doc: '', color: '', username: userName });
  }

  join(DocId, username) {
    this.socket.emit('join', { id: DocId, user : username });
  }

  leave(DocId, username) {
    this.socket.emit('leave', { id: DocId, user : username });
  }

  editDocument(documentId, newDocumentId) {
    var doc = {
      previous: documentId,
      new: newDocumentId
    };
    this.socket.emit('editDoc', doc);
  }

  private docId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
