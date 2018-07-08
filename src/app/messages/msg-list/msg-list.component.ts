import { Message } from './../message.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-msg-list',
  templateUrl: './msg-list.component.html',
  styleUrls: ['./msg-list.component.css']
})
export class MsgListComponent implements OnInit {

  // messages = [
  //   { autore: 'Primo utente', contenuto: 'Primo messaggio di registrazione' },
  //   { autore: 'Secondo utente', contenuto: 'Secondo messaggio di registrazione' },
  //   { autore: 'Terzo utente', contenuto: 'Terzo messaggio di registrazione' }
  // ];

  @Input() messages: Message[] = [];

  constructor() { }

  ngOnInit() {
  }

}
