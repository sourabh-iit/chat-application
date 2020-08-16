import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public user = {
    username: '',
    password: ''
  }

  busy = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  login() {
    this.busy = true;
    this.userService.login(this.user).subscribe((res: any) => {
      this.router.navigate(['/']);
    });
  }

}
