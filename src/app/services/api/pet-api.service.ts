import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';



// 定義寵物資料的 TypeScript 介面
interface PetSummary {
  pId: number;
  pName: string;
  species: string;
  age: number;
  sex: '公' | '母' | '未知';
}

export interface PetDetail extends PetSummary {
  userId: number;
  weight: number | null; // 體重可能是 NULL
}

@Injectable({
  providedIn: 'root'
})
export class PetApiService {
  private apiUrl = `${environment.apiBaseUrl}/api/pet`;

  // 新增目前選取的寵物 ID
  private currentPetId$ = new BehaviorSubject<number | null>(null);



  constructor(private http: HttpClient) { }

  // 設定目前寵物
  setCurrentPetId(pId: number) {
    this.currentPetId$.next(pId);
  }

  // 取得目前寵物 ID（可訂閱）
  getCurrentPetId(): Observable<number | null> {
    return this.currentPetId$.asObservable();
  }

  // 取得目前寵物 ID（同步值）
  getCurrentPetIdValue(): number | null {
    return this.currentPetId$.getValue();
  }


  /**
   * 取得特定用戶的所有寵物列表
   * @param userId 當前登入的用戶 ID
   * @returns 寵物摘要資訊陣列
   */
  getPetsByUserId(userId: number): Observable<PetSummary[]> {
    return this.http.get<PetSummary[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * 取得單一寵物的詳細資料
   * @param pId 寵物 ID
   * @returns 寵物完整資料
   */
  getPetDetail(pId: number): Observable<PetDetail> {
    return this.http.get<PetDetail>(`${this.apiUrl}/${pId}`);
  }
}
