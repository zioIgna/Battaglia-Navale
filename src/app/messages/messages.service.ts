import { Router } from '@angular/router';
import { Injectable } from '../../../node_modules/@angular/core';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { Message } from './message.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    private messages: Message[] = [];
    private messagesUpdated = new Subject<Message[]>();

    constructor(private http: HttpClient, private router: Router) { }

    getMessages() {
        this.http.get<{ note: string, messages: any }>('http://localhost:3000/api/messages')
            .pipe(map((msgData) => {
                return msgData.messages.map(message => {
                    return {
                        autore: message.autore,
                        contenuto: message.contenuto,
                        destinatario: message.destinatario,
                        timeStamp: message.date
                    };
                });
            }))
            .subscribe((transformedMsgData) => {
                this.messages = transformedMsgData;
                this.messagesUpdated.next([...this.messages]);
            });
    }

    getMessagesUpdatedListener() {
        return this.messagesUpdated.asObservable();
    }

    addMessage(message: Message) {
        const newMessage: Message = {
            // id: null,
            autore: message.autore,
            contenuto: message.contenuto,
            destinatario: message.destinatario,
            timeStamp: message.timeStamp    // in realtà questo parametro non viene considerato dal server
        };
        this.http.post<{ note: string }>('http://localhost:3000/api/messages', newMessage)
            .subscribe((responseData) => {
                console.log(responseData.note);
                this.messages.push(newMessage);
                this.messagesUpdated.next([...this.messages]);
                this.router.navigate(['/']);
            });
    }
}
// Password per cluster Mongodb:
// PozKas6M2IC1JgR7
