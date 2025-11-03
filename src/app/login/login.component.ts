import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthApiService } from '../services/api/auth-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userphone = '';
  password = '';

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<LoginComponent>,
    private authApiService: AuthApiService
  ) {}

  login() {
    // 1. 準備發送給後端的資料
    const loginData = { phone: this.userphone, password: this.password };

    // 2. 呼叫服務發送登入請求
    this.authApiService.login(loginData).subscribe({
      next: (response) => {
        const userId = response.userId;

        // 🎯 修正：在跳轉前，明確通知 AuthApiService 狀態已改變 🎯
        this.authApiService.notifyLoginSuccess(userId); // ❗ 新增這一行 ❗
        console.log('✅ 登入成功，服務已更新快取:', userId);

        this.dialogRef.close();
       
        this.userphone = '';
        this.password = '';
        this.router.navigate(['/']);
      },
      error: (err) => {
        // 登入失敗處理
        console.error('登入失敗:', err);
        alert('登入失敗，請檢查帳號或密碼。');
      }
    });
  }

  cancel(){
    this.dialogRef.close();
  }

  goToRegister() {
  // 先關掉登入彈窗
  this.dialogRef.close();

  // 再跳到註冊頁
  this.router.navigate(['/register']);
  }
}
