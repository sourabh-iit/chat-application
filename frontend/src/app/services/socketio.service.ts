import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';


@Injectable()
export class SocketioService {
    socket;
    newEvent$ = new BehaviorSubject<any>(null);
    private isConnected = true;

    constructor(
        private userService: UserService
    ) {
        this.socket = io(environment.SOCKET_ENDPOINT);
        this.subscribeEvents(['message', 'new user', 'connect', 'start typing', 'stop typing']);
        this.newEvent$.subscribe((data) => {
            if(data) {
                switch (data.event) {
                    case 'connect':
                        this.emitEvent('new user', userService.user.username);
                        break;
                }
            }
        });
    }

    subscribeEvents(events: Array<string>) {
        events.forEach((event: string) => {
            this.socket.on(event, (data: any) => {
                this.newEvent$.next({event: event, data: data});
            });
        });
    }

    emitEvent(event: string, data = {}) {
        this.socket.emit(event, data);
    }

    disconnect() {
        this.socket.disconnect();
        this.isConnected = false;
    }

    connect() {
        if(!this.isConnected) {
            this.socket.connect();
        }
    }
}