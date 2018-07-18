import { Component, OnInit } from '@angular/core';
import { Message } from '../message.model';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-message-create',
  templateUrl: './message-create.component.html',
  styleUrls: ['./message-create.component.css']
})
export class MessageCreateComponent implements OnInit {
  autore = '';
  contenuto = '';
  destinatario = '';

  constructor(private msgService: MessagesService) { }

  onSend() {
    const message: Message = {
      id: null,
      autore: this.autore,
      contenuto: this.contenuto,
      destinatario: this.destinatario,
      timeStamp: new Date().toISOString()
    };
    this.msgService.addMessage(message);
    this.autore = '';
    this.contenuto = '';
    this.destinatario = '';
  }

  ngOnInit() {
  }

}
