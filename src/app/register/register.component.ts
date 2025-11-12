import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { AuthApiService, FullRegisterData } from '../services/api/auth-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';
  confirmPassword = '';


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private authApi: AuthApiService
  ) {
    //初始化
    this.registerForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      userName: [''],
      pName: ['', Validators.required],
      species: ['', Validators.required],
      sex: ['', Validators.required],
      age: [null],
      weight: [null]
    });
  }

  onSubmit() {

    // 1. 表單驗證
    if (this.registerForm.invalid) {
      this.errorMessage = '請填寫所有必填欄位。';
      return;
    }

    // 2. 密碼比對 (使用表單中的密碼欄位與 confirmPassword 屬性)
    const formPassword = this.registerForm.get('password')?.value;

    if (formPassword !== this.confirmPassword) {
      this.errorMessage = '密碼與確認密碼不一致。';
      return;
    }

    // 3. 取得表單的所有數據
    const formData: FullRegisterData = this.registerForm.value;

    // 4. 呼叫 API
    this.authApi.registerUserAndFirstPet(formData).subscribe({
      next: (response) => {
        console.log('註冊與寵物新增成功！', response);
        alert('恭喜您，帳號與首隻寵物資料建立成功！');

        // 1. 彈出 Login 彈窗
        this.dialog.open(LoginComponent, {
          width: '300px'
        });

        // 2. 導向首頁路由
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('註冊失敗', err);
        this.errorMessage = err.error?.message || '註冊過程中發生錯誤。';
      }
    });
  }

  openLogin(){
    this.dialog.open(LoginComponent,{
      width: '300px'
    });

  }
  // 保持這個函式，方便用戶點擊註冊後跳轉
  goToLogin() {
    this.router.navigate(['/']);
    this.openLogin();
  }
}
