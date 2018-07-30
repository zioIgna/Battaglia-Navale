import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MessageCreateComponent } from './messages/message-create/message-create.component';
import {
  MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatExpansionModule,
  // MatBadgeModule,
  MatSelectModule
} from '@angular/material';
import { HeaderComponent } from './header/header.component';
import { MsgListComponent } from './messages/msg-list/msg-list.component';
import { UserCreateComponent } from './users/user-create/user-create.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserLoginComponent } from './users/user-login/user-login.component';
import { AuthInterceptor } from './users/auth-interceptor';
import { OverviewComponent } from './overview/overview.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    MessageCreateComponent,
    HeaderComponent,
    MsgListComponent,
    UserCreateComponent,
    UserLoginComponent,
    UsersListComponent,
    OverviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    // MatBadgeModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatToolbarModule,
    MatExpansionModule,
    HttpClientModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
