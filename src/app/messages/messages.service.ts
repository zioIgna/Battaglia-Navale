import { Message } from './message.model';
import { Injectable } from '../../../node_modules/@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '../../../node_modules/@angular/common/http';
// import * as io from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    private messages: Message[] = [];
    private messagesUpdated = new Subject<Message[]>();
    // proprietà aggiunte da me:
    // private socket;
    // private url = 'http://localhost:3000/api/messages';

    constructor(private http: HttpClient) { }

    getMessages() {
        this.http.get<{ note: string, messages: Message[] }>('http://localhost:3000/api/messages')
            .subscribe((msgData) => {
                this.messages = msgData.messages;
                this.messagesUpdated.next([...this.messages]);
            });

        // questa parte l'ho aggiunta io:
        // const observable = new Observable(observer => {
        //     this.socket = io(this.url);
        //     this.socket.on('message', (data) => {
        //         observer.next(data);
        //     });
        //     return () => {
        //         this.socket.disconnect();
        //     };
        // });
        // return observable;
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
