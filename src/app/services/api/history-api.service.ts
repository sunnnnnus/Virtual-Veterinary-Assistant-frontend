import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryApiService {
  private apiUrl = `${environment.apiBaseUrl}/api/history`;
  private historyUpdated$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // 取得歷史紀錄
  getConversationHistory(petId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${petId}`);
  }

  // 儲存問診紀錄
  saveConversationHistory(data: {
    petId: number;
    title: string;
    severity: string;
    finalAdvice: string;
    diseaseId: number;
    timestamp: string;
    messages: {
      sender: string;
      text: string;
      timestamp: Date;
    }[];
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  // 通知其他元件更新
  notifyHistoryUpdated() {
    this.historyUpdated$.next();
  }

  onHistoryUpdated(): Observable<void> {
    return this.historyUpdated$.asObservable();
  }
}
