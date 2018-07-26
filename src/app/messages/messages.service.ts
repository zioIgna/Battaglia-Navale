import { Message } from './message.model';
import { Injectable, OnInit } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsersService } from '../users/users.service';
// import * as io from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class MessagesService implements OnInit {
    private messages: Message[] = [];
    private messagesUpdated = new Subject<Message[]>();
    private loggedEmail: string;
    private loggedEmailListener: Subscription;
    private loggedEmailListenerSub: Subscription;

    // proprietà aggiunte da me:
    // private socket;
    // private url = 'http://localhost:3000/api/messages';

    constructor(private http: HttpClient, private usersService: UsersService) { }

    getMessages(loggedUser: string) {
        // if (this.loggedEmail) {
        //     console.log('E loggato!');
        //     this.http.get<{ note: string, messages: Message[] }>('http://localhost:3000/api/messages/' + this.loggedEmail)
        //     .subscribe((msgData) => {
        //         this.messages = msgData.messages;
        //         this.messagesUpdated.next([...this.messages]);
        //     }, err => {
        //         console.log('Recupero messaggi non riuscito');
        //     });
        // }
        // this.loggedEmail = this.usersService.getLoggedEmail();
        // this.loggedEmailListenerSub = this.usersService.getLoggedEmailListener().subscribe(loggedUser => {
        //     this.loggedEmail = loggedUser;
            this.http.get<{ note: string, messages: Message[] }>('http://localhost:3000/api/messages/' + loggedUser)
                .subscribe((msgData) => {
                    this.messages = msgData.messages;
                    this.messagesUpdated.next([...this.messages]);
                }, err => {
                    console.log('Recupero messaggi non riuscito', err);
                });
        // });


        // let loggedUser = this.loggedEmail;
        // this.http.get<{ note: string, messages: Message[] }>('http://localhost:3000/api/messages/' + loggedUser)
        // .subscribe((msgData) => {
        //     this.messages = msgData.messages;
        //     this.messagesUpdated.next([...this.messages]);
        // });
        // this.loggedEmailListener2 = this.usersService.getLoggedEmailListener().subscribe(loggedMail => {
        //     loggedUser = loggedMail;
        //     console.log('questo è lo user loggato prima di richiedere i msg: ', loggedUser);
        //     this.http.get<{ note: string, messages: Message[] }>('http://localhost:3000/api/messages/' + loggedUser)
        //     .subscribe((msgData) => {
        //         this.messages = msgData.messages;
        //         this.messagesUpdated.next([...this.messages]);
        //     });
        // });

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
            autore: message.autore,
            contenuto: message.contenuto,
            destinatario: message.destinatario,
            timeStamp: message.timeStamp
        };
        this.http.post<{ note: string, msg: object }>('http://localhost:3000/api/messages', newMessage)
            .subscribe((responseData) => {
                console.log(responseData.note);
                console.log('messaggio salvato: ', responseData.msg);
                this.messages.push(newMessage);
                this.messagesUpdated.next([...this.messages]);
            }, err => {
                console.log('No message sent ', err);
            });
    }

    ngOnInit() {
        this.loggedEmail = this.usersService.getLoggedEmail();
        this.loggedEmailListener = this.usersService.getLoggedEmailListener().subscribe(loggedMail => {
            this.loggedEmail = loggedMail;
        });
    }
}
