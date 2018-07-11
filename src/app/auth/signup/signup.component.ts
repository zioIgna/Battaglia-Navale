import { AuthService } from './../auth.service';
import { Component } from '@angular/core';
import { NgForm } from '../../../../node_modules/@angular/forms';

@Component({
    templateUrl: './signUp.component.html',
    styleUrls: ['./signUp.component.css']
})
export class SignUpComponent {
    isLoading = false;

    constructor(public authService: AuthService) { }

    onSignUp(form: NgForm) {
        if (form.invalid) {
            return;
        }
        this.isLoading = true;
        this.authService.createUser(form.value.email, form.value.password);
        // console.log(form);
    }

}
