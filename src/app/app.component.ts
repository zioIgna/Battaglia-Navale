import { Message } from './messages/message.model';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  storedMessages: Message[] = [];

  onMsgSent(message) {
    this.storedMessages.push(message);
  }

}
