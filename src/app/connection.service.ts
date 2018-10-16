import { Injectable } from '@angular/core';
import * as socketIo from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
// import { UsersService } from './users/users.service';

@Injectable({
    providedIn: 'root'
})
export class ConnectionService {
    socket = null;
    binaryId = -1;

    // da qui inserito per prova di trasmissione id connessione
    private subject = new Subject<any>();

    sendId(id: any) {
        this.subject.next({ myId: id });
    }

    getId(): Observable<any> {
        return this.subject.asObservable();
    }
    // a qui

    // ngOnInit() {
    //     this.socket = socketIo('http://localhost:3000');
    // }

    // constructor(private usersService: UsersService) { }

    getConnection() {
        if (this.socket === null) {
            this.socket = socketIo('http://localhost:3000');
            console.log('i dati del socket appena connesso sono: ' + this.socket);  // aggiunto per prova
        }
    }


}
