import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user',
  template: `
    <div class="name-container">
      <div class="status" [class.online]="isOnline"></div>
      <div class="ml-2">{{user.first_name}} {{user.last_name}}</div>
    </div>
  `,
  styleUrls: ['./user.scss']
})
export class UserComponent {
  @Input() isOnline;
  @Input() user;
}
