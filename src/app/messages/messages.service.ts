import { Message } from './message.model';
import { Injectable } from '../../../node_modules/@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '../../../node_modules/@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    private messages: Message[] = [];
    private messagesUpdated = new Subject<Message[]>();

    constructor(private http: HttpClient) { }

    getMessages() {
        this.http.get<{ note: string, messages: Message[] }>('http://localhost:3000/api/messages')
            .subscribe((msgData) => {
                this.messages = msgData.messages;
                this.messagesUpdated.next([...this.messages]);
            });
    }

    getMessagesUpdatedListener() {
        return this.messagesUpdated.asObservable();
    }

    addMessage(message: Message) {
        const newMessage: Message = {
            id: null,
            autore: message.autore,
            contenuto: message.contenuto,
            destinatario: null,
            timeStamp: message.timeStamp
        };
        this.http.post<{ note: string }>('http://localhost:3000/api/messages', newMessage)
            .subscribe((responseData) => {
                console.log(responseData.note);
                this.messages.push(newMessage);
                this.messagesUpdated.next([...this.messages]);
            });
    }
}
