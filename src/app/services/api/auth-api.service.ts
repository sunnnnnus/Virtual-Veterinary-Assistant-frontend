import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface FullRegisterData {
  phone: string;
  password: string;
  userName?: string;
  pName: string;
  species: string;
  age: number | null;
  sex: '公' | '母' | '未知';
  weight: number | null;
}

export interface RegisterResponse {
  message: string;
  userId: number;
  userName: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
  token: string;
  defaultPetId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private apiUrl = `${environment.apiBaseUrl}/api/auth`;

  /** 用 BehaviorSubject 管理登入狀態 */
  private _defaultPetId = new BehaviorSubject<number | null>(null);
  private _currentUserId = new BehaviorSubject<number | null>(null);
  public currentUserId$ = this._currentUserId.asObservable();

  constructor(private http: HttpClient) {
  }

  /** 手動恢復登入狀態（例如在 AppComponent 呼叫） */
  public restoreSession(): void {
    const savedId = this.readUserIdFromStorage();
    if (savedId) {
      this._currentUserId.next(savedId);
    } else {
      console.log('🟡 沒有可恢復的登入狀態');
    }
  }

  /** 從 localStorage 讀取 userId（純函式，不觸發狀態） */
  private readUserIdFromStorage(): number | null {
    const raw = localStorage.getItem('current_user_id');
    return raw ? parseInt(raw, 10) : null;
  }

  /** 僅登入成功後才能正確取得 userId */
  getCurrentUserId(): number | null {
    return this._currentUserId.value;
  }

  /** 註冊（同時建立使用者與首隻寵物） */
  registerUserAndFirstPet(data: FullRegisterData): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  /** 登入處理 */
  login(data: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        this._currentUserId.next(res.userId);
        this._defaultPetId.next(res.defaultPetId);  // 存 defaultPetId
        localStorage.setItem('current_user_id', res.userId.toString());
        if (res.defaultPetId) {
          localStorage.setItem('default_pet_id', res.defaultPetId.toString());
        }
      })
    );
  }

  getDefaultPetId(): number | null {
    return this._defaultPetId.value;
  }

  /** 登入成功（如果 LoginComponent 用外部驗證登入） */
  notifyLoginSuccess(userId: number): void {
    localStorage.setItem('current_user_id', userId.toString());
    this._currentUserId.next(userId);
  }

  /** 登出並清除狀態 */
  logout(): void {
    localStorage.removeItem('current_user_id');
    this._currentUserId.next(null);
  }

  get currentUserId(): Observable<number | null> {
  return this._currentUserId.asObservable();
}
}
