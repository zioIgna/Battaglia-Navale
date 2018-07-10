import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Message } from './../message.model';
import { MessagesService } from '../messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-msg-list',
  templateUrl: './msg-list.component.html',
  styleUrls: ['./msg-list.component.css']
})
export class MsgListComponent implements OnInit, OnDestroy {

  // messages = [
  //   { autore: 'Primo utente', contenuto: 'Primo messaggio di registrazione' },
  //   { autore: 'Secondo utente', contenuto: 'Secondo messaggio di registrazione' },
  //   { autore: 'Terzo utente', contenuto: 'Terzo messaggio di registrazione' }
  // ];

  messages: Message[] = [];
  msgSub: Subscription;
  isLoading = false;

  constructor(public msgService: MessagesService) {

  }

  ngOnInit() {
    this.isLoading = true;
    this.msgService.getMessages();
    this.msgSub = this.msgService.getMessagesUpdatedListener()
      .subscribe((fetchedMessages: Message[]) => {
        this.isLoading = false;
        this.messages = fetchedMessages;
      });
  }

  ngOnDestroy() {
    this.msgSub.unsubscribe();
  }

}
