import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { SocketioService } from '../services/socketio.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {

  public users = [];
  public loadingUsers = true;
  public chatBoxes = [];
  public opened = {};
  private subs = new Subscription();

  constructor(
    private userService: UserService,
    private socket: SocketioService
  ) {
    this.subs.add(this.userService.loadUsers().subscribe((res: any) => {
      this.users = res.data.filter((u: any) => u.username != userService.user.username);
      this.loadingUsers = false;
    }));
  }

  ngOnInit(): void {
    this.socket.connect();
    this.subs.add(this.socket.newEvent$.subscribe((res: any) => {
      if(res && this.chatBoxes.length>0 && res.event == 'message') {
        const message = res.data;
        for(let num in this.chatBoxes) {
          this.appendMessage(parseInt(num), message);
        }
      }
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.socket.disconnect();
  }

  appendMessage(num: number, message) {
    const to = this.chatBoxes[num].user.username;
    const from = this.userService.user.username;
    if((message.from == from && message.to == to) || (message.from == to && message.to == from)) {
      this.chatBoxes[num].chat.push(message);
    }
  }

  openChatBox(user: any) {
    if(this.chatBoxes.length == 2) {
      // should not open more than 2 chat boxes
      return;
    }
    if(user.username in this.opened) {
      return;
    }
    this.chatBoxes.push({
      user: user,
      currMessage: "",
      sendingMsg: false,
      chat: [],
      minimized: false
    });
    this.subs.add(this.userService.loadChat(user.username).subscribe((res: any) => {
      this.chatBoxes[this.chatBoxes.length-1].chat = res.data;
    }));
  }

  sendMessage(num: number) {
    if(this.chatBoxes[num].sendingMsg) {
      return;
    }
    this.chatBoxes[num].sendingMsg = true;
    this.subs.add(this.userService.sendMessage(this.chatBoxes[num].user.username, this.chatBoxes[num].currMessage)
    .subscribe((res: any) => {
      this.chatBoxes[num].currMessage = "";
      this.chatBoxes[num].sendingMsg = false;
    }));
  }

  closeChatBox(num: number) {
    delete this.opened[this.chatBoxes[num].user.username];
    this.chatBoxes.splice(num, 1);
  }

  minimizeChatBox(num: number) {
    this.chatBoxes[num].minimized = !this.chatBoxes[num].minimized;
  }

}
