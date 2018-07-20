import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../user.model';
import { UsersService } from '../users.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, OnDestroy {

    users: User[] = [];
    usersSub: Subscription;
    isAdmin = false;
    private adminSub: Subscription;
    private loggedUserId: string;
    private loggedUserIdSub: Subscription;
    private loggedUserEmail: string;
    private loggedEmailSub: Subscription;

    constructor(private usersService: UsersService) { }

    ngOnInit() {
        this.usersService.getUsers();
        this.usersSub = this.usersService.getUsersUpdatedListener().subscribe(fetchedUsers => {
            this.users = fetchedUsers;
        });
        this.isAdmin = this.usersService.getIsAdmin();
        this.adminSub = this.usersService.getAdminStatusListener().subscribe(hasAdminRole => {
            this.isAdmin = hasAdminRole;
            console.log('ho ricevuto il nuovo ruolo', hasAdminRole);
        });
        this.loggedUserId = this.usersService.getLoggedId();
        this.loggedUserIdSub = this.usersService.getLoggedUserIdListener().subscribe(loggedId => {
            this.loggedUserId = loggedId;
        });
        this.loggedUserEmail = this.usersService.getLoggedEmail();
        this.loggedEmailSub = this.usersService.getLoggedEmailListener().subscribe(loggedUser => {
            this.loggedUserEmail = loggedUser;
        });

    }

    ngOnDestroy() {
        this.usersSub.unsubscribe();
        this.adminSub.unsubscribe();
        this.loggedUserIdSub.unsubscribe();
    }

}
