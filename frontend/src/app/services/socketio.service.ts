import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class SocketioService {
    socket;
    newEvent$ = new BehaviorSubject<any>(null);
    private isConnected = true;

    constructor() {
        this.socket = io(environment.SOCKET_ENDPOINT);
        this.subscribeEvent('message');
    }

    subscribeEvent(event: string) {
        this.socket.on(event, (data: any) => {
            this.newEvent$.next({event: event, data: data});
        });
    }

    disconnect() {
        this.socket.disconnect();
        this.isConnected = false;
    }

    connect() {
        if(!this.isConnected) {
            this.socket.connect();
            this.subscribeEvent('message');
        }
    }
}