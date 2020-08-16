import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  user = {
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirm_password: ''
  }

  busy = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  register() {
    this.userService.register(this.user).subscribe(() => {
      this.router.navigate(['..', 'login'], {relativeTo: this.route});
    });
  }

}
