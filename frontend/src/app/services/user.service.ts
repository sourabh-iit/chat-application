import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';


@Injectable()
export class UserService {

    private api = '/api/v1';

    constructor(
        private http: HttpClient
    ) {
        
    }

    register(user: any) {
        const endpoint = this.api+'/register';
        return this.http.post(endpoint, user);
    }

    login(user: {username: string, password: string}) {
        const endpoint = `${this.api}/login`;
        return this.http.post(endpoint, {
            username: user.username,
            password: user.password
        }).pipe(tap((res: any) => localStorage.setItem('user', JSON.stringify({
            username: user.username,
            token: res.token
        }))));
    }

    isLoggedIn() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if(user.token) {
                return true;
            }
            return false;
        } catch(e) {
            return false;
        }
    }

    logout() {
        localStorage.removeItem('user');
    }

    loadUsers() {
        const endpoint = `${this.api}/users`;
        return this.http.get(endpoint);
    }

    get user(): any {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch(e) {
            return {};
        }
    }

    loadChat(username) {
        const endpoint = `${this.api}/chat/${username}`;
        return this.http.get(endpoint);
    }

    sendMessage(username, message) {
        const endpoint = `${this.api}/chat/${username}`;
        return this.http.post(endpoint, {
            message: message
        });
    }
}