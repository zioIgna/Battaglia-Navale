import { Message } from './../message.model';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-message-create',
  templateUrl: './message-create.component.html',
  styleUrls: ['./message-create.component.css']
})
export class MessageCreateComponent implements OnInit {
  autore = '';
  contenuto = '';
  @Output() msgSent = new EventEmitter<Message>();

  constructor() { }

  onSend() {
    const message: Message = {
      autore: this.autore,
      contenuto: this.contenuto,
      timeStamp: new Date().toISOString()
    };
    this.msgSent.emit(message);
  }

  ngOnInit() {
  }

}
