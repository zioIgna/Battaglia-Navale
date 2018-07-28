import { UsersService } from './../../users/users.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Message } from '../message.model';
import { MessagesService } from '../messages.service';
import { Subscription, empty } from 'rxjs';

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
    loggedEmail: string;
    loggedEmailListenerSub: Subscription;
    soloAutori: string[] = [];
    sortedMsgs: {}; // messaggi raggruppati per autori in array (array di array) a indici letterali (email)
    myMsgs: Message[] = [];
    otherMsgs: any[] = [];

    constructor(public msgService: MessagesService, public usersService: UsersService) { }

    getAuthors(msgs) {
        for (const msg of msgs) {
            if (!(this.soloAutori.includes(msg.autore))) {
                this.soloAutori.push(msg.autore);
                console.log(this.soloAutori);
            }
        }
    }

    alloca(msgs: Message[], autori: string[]) { // raggruppa i messaggi per autori (in un array di array)
        // const conversazioni: any[] = [];
        // for (const header of autori) {
        //     conversazioni[header] = [];
        //     for (const msg of msgs) {
        //         if (msg.autore === header) {
        //             conversazioni[header].push(msg);
        //         }
        //     }
        //     this.sortedMsgs.push(conversazioni[header]);

        // for (const header of autori) {
        //     this.sortedMsgs[header] = [];
        //     for (const msg of msgs) {
        //         console.log(this.sortedMsgs[header]);
        //         if (msg.autore === header) {
        //             this.sortedMsgs[header].push(msg);
        //         }
        //     }
        //     this.sortedMsgs.push(this.sortedMsgs[header]);
        // }
        const conversazioni = {};
        for (const header of autori) {
            conversazioni[header] = [];
            console.log('inizializzo conversazioni[header]');
            console.log(conversazioni[header]);
            for (const msg of msgs) {
                if (msg.autore === header) {
                    conversazioni[header].push(msg);
                    console.log(msg);
                    console.log(conversazioni[header]);
                    console.log('aggiunto: ' + msg + ' a ' + conversazioni[header]);
                }
            }
        }
        return conversazioni;
    }

    getMyMsgs(autore: string) {     // porre: myMsgs = getMsgs(...) per popolare tale array con i messaggi del soggetto loggato
        return { ...this.sortedMsgs[autore] };
    }

    getOtherMsgs(autore: string) {  // per popolare otherMsgs solo con i messaggi degli altri utenti
        this.otherMsgs = this.sortedMsgs.filter((element, index, array) => {
            console.log(Object.keys(array)[index + array.length]);
            return Object.keys(array)[index + array.length] !== autore;
        });
    }

    // spartisci2(myMsgs, otherMsgs) {   // per spostare i myMsgs negli array con i relativi destinatari
    //     for (let i = 0; i < myMsgs.length; i++) {
    //         for (let j = 0; j < otherMsgs.length; j++) {
    //             if (myMsgs[i].destinatario === otherMsgs[j][0].autore) {
    //                 otherMsgs[j].push(myMsgs[i]);
    //                 myMsgs.splice(i, 1);
    //             }
    //         }
    //     }
    //     if (myMsgs.length > 0) {
    //         otherMsgs.push(myMsgs);
    //     }
    // }

    spartisci(myMsgs, otherMsgs) {   // per spostare i myMsgs negli array con i relativi destinatari
        for (let i = 0; i < myMsgs.length; i++) {
            for (let j = 0; j < otherMsgs.length; j++) {
                if (myMsgs[i].destinatario === otherMsgs[j][0].autore) {
                    otherMsgs[j].push(myMsgs[i]);
                    myMsgs.splice(i, 1);
                    i--;
                }
            }
        }
        if (myMsgs.length > 0) {
            for (let i = 0; i < myMsgs.length; i++) {
                const newArr = [];
                newArr.push(myMsgs[i]);
                otherMsgs.push(newArr);
                myMsgs.splice(i, 1);
                i--;
            }
        }
    }

    sortMessages() {
        console.log('questi sono i messages: ', this.messages);
        this.getAuthors(this.messages);
        console.log('ho ottenuto gli autori: ', this.soloAutori);
        this.sortedMsgs = this.alloca(this.messages, this.soloAutori);
        console.log('ho spartito i messaggi per autori', this.sortedMsgs);
        // console.log('questa è la lunghezza di sortedMsgs: ', this.sortedMsgs.length);
        // console.log('e questo è il primo vettore dentro sortedMsgs: ', this.sortedMsgs[0]);
        // console.log('e questo è il secondo vettore dentro sortedMsgs: ', this.sortedMsgs[1]);
        // console.log('e la sua lunghezza: ', this.sortedMsgs[1].length);
        // this.myMsgs = this.getMyMsgs(this.loggedEmail);
        this.myMsgs = [...this.sortedMsgs[this.loggedEmail]];
        console.log('questi sono i myMsgs: ', this.myMsgs);
        // this.getOtherMsgs(this.loggedEmail);
        this.otherMsgs = Object.keys(this.sortedMsgs)
            .filter(key => key !== this.loggedEmail)
            .reduce((obj, key) => {
                // let empty: any[] = [];
                return [...obj,
                obj[key] = this.sortedMsgs[key]];
            }, []);
        console.log('questi sono gli otherMsgs: ', this.otherMsgs);
        this.spartisci(this.myMsgs, this.otherMsgs);
        console.log('ora questi sono gli otherMsgs: ', this.otherMsgs);
    }

    ngOnInit() {
        this.loggedEmail = this.usersService.getLoggedEmail();
        this.msgService.getMessages(this.loggedEmail);

        // this.sortMessages();

        // this.loggedEmailListenerSub = this.usersService.getLoggedEmailListener()
        //     .subscribe(loggedUser => {
        //         this.loggedEmail = loggedUser;
        //         this.msgService.getMessages(loggedUser);
        //     });

        this.msgSub = this.msgService.getMessagesUpdatedListener()
            .subscribe((fetchedMessages: Message[]) => {
                this.messages = fetchedMessages;
                this.sortMessages();
            });
    }

    ngOnDestroy() {
        this.msgSub.unsubscribe();
    }

}
