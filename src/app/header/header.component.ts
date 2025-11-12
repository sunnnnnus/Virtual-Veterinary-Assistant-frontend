import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  @Output() menuClicked = new EventEmitter<void>();
  isLogin = false;
  petName = '';
  isMobile = false;

  constructor(
    private dialog: MatDialog,
    private authApi: AuthApiService,
    private petApi: PetApiService,

  ) {}

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
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
  emitMenuClick() {
    this.menuClicked.emit();
  }
  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }
  logout(): void {
    this.authApi.logout();
    this.petName = '';
  }
}

