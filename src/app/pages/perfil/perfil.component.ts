import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from "@auth0/angular-jwt";

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private access_token: string;
  userName : string;
  roles : string;
  
  constructor() { }

  ngOnInit(): void {
    this.access_token = sessionStorage.getItem(environment.TOKEN_NAME);
    const helper = new JwtHelperService();

    let decodedToken = helper.decodeToken(this.access_token);
    this.userName = decodedToken.user_name;
    this.roles = decodedToken.authorities.toString();
  }

}
