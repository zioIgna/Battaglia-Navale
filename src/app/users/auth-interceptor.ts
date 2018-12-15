import { HttpInterceptor, HttpRequest, HttpHandler } from '../../../node_modules/@angular/common/http';
import { Injectable } from '../../../node_modules/@angular/core';
import { UsersService } from './users.service';


// questo servizio viene fornito in maniera particolare:
// in app.module.ts, tra i providers si inserisce un nuovo oggetto:
// {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private usersService: UsersService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        const authToken = this.usersService.getToken();
        // console.log('questo è l\'authtoken: ', authToken);
        const authRequest = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authToken)
        });
        // console.log('authInteceptor in azione', authRequest, authRequest.headers);
        return next.handle(authRequest);
    }
}
