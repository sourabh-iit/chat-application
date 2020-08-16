import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SocketioService } from '../../services/socketio.service';
import { Subscription } from 'rxjs';

const maxChatBoxes = 3;

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
  private onlineUsers = [];
  private typingUsers = [];
  public me;

  constructor(
    private userService: UserService,
    private socket: SocketioService
  ) {
    this.me = this.userService.user;
    this.subs.add(this.userService.loadUsers().subscribe((res: any) => {
      this.users = res.data.filter((u: any) => u.username != this.me.username);
      this.loadingUsers = false;
    }));
  }

  ngOnInit(): void {
    this.socket.connect();
    this.subs.add(this.socket.newEvent$.subscribe((res: any) => {
      if(res) {
        let chatBox;
        switch (res.event) {
          case 'start typing':
            if(this.typingUsers.indexOf(res.data) == -1) {
              this.typingUsers.push(res.data);
            }
            break;
          case 'stop typing':
            const index = this.typingUsers.indexOf(res.data);
            if(index > -1) {
              this.typingUsers.splice(index, 1);
            }
            break;
          case 'new user':
            this.onlineUsers = res.data;
            break;
        }
        if(this.chatBoxes.length > 0) {
          switch (res.event) {
            case 'message':
              const message = res.data;
              for(let num in this.chatBoxes) {
                this.appendMessage(parseInt(num), message);
              }
              break;
          }
        }
      }
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.socket.disconnect();
  }

  getChatBoxByUser(username: string) {
    for(let chatBox of this.chatBoxes) {
      if(chatBox.user.username == username) {
        return chatBox;
      }
    }
    return null;
  }

  isOnline(username: string) {
    return this.onlineUsers.findIndex((user: string) => user === username) > -1;
  }

  isTyping(username: string) {
    return this.typingUsers.indexOf(username) > -1;
  }

  appendMessage(num: number, message) {
    const to = this.chatBoxes[num].user.username;
    const from = this.me.username;
    if((message.from == from && message.to == to) || (message.from == to && message.to == from)) {
      this.chatBoxes[num].chat.push(message);
    }
  }

  getIndexOfChatBoxToReplace() {
    // replace it with least recently used chat box
    return 0;
  }

  openChatBox(user: any) {
    if(user.username in this.opened) {
      return;
    }
    const chatBox = {
      user: user,
      currMessage: "",
      sendingMsg: false,
      chat: [],
      minimized: false,
      typing: false
    };
    this.opened[user.username] = true;
    if(this.chatBoxes.length == maxChatBoxes) {
      const index = this.getIndexOfChatBoxToReplace();
      delete this.opened[this.chatBoxes[index].user.username];
      this.chatBoxes[index] = chatBox;
    } else {
      this.chatBoxes.push(chatBox);
    }
    this.subs.add(this.userService.loadChat(user.username).subscribe((res: any) => {
      chatBox.chat = res.data;
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

  typing(chatBox) {
    if(chatBox.currMessage.length > 0) {
      this.socket.emitEvent('start typing', chatBox.user.username);
    } else {
      this.socket.emitEvent('stop typing', chatBox.user.username);
    }
  }

}
