import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { AuthApiService } from '../services/api/auth-api.service';
import { PetApiService } from '../services/api/pet-api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLogin = false;
  petName = '';

  constructor(
    private dialog: MatDialog,
    private authApi: AuthApiService,
    private petApi: PetApiService,

  ) {}

  ngOnInit(): void {
    this.authApi.currentUserId$.subscribe(userId => {
      this.isLogin = !!userId;

      if (this.isLogin) {
        this.petApi.getCurrentPetId().subscribe(pId => {
          if (pId) {
            this.petApi.getPetDetail(pId).subscribe(pet => {
              this.petName = pet.pName;
            });
          }
        });
      }
    });
  }


  openLogin(){
    this.dialog.open(LoginComponent,{
      width: '300px'
    });
  }

}
