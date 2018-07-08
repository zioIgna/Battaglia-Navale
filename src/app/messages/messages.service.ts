import { Message } from './message.model';
import { Injectable } from '../../../node_modules/@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    private messages: Message[] = [];
    private messagesUpdated = new Subject<Message[]>();

    getMessages() {
        return [...this.messages];
    }

    getMessagesUpdatedListener() {
        return this.messagesUpdated.asObservable();
    }

    addMessage(message: Message) {
        const newMessage: Message = {
            autore: message.autore,
            contenuto: message.contenuto,
            timeStamp: message.timeStamp
        };
        this.messages.push(newMessage);
        this.messagesUpdated.next([...this.messages]);
    }
}
