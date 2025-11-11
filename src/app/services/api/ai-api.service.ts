import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  conversationId?: number;
  aiSummary?: string;       // AI 回覆摘要或額外資訊
  showMapButton: boolean;
  diseaseName?: string;
  severity?: string;
  id: string;
}

// 定義發送到後端的請求介面
export interface AIChatRequest {
  userId: number; // 用於上下文管理或寵物資料查詢
  petId: number;  // 當前選擇的寵物 ID
  message: string;
  chatHistory?: { sender: 'user' | 'ai' | 'system'; text: string }[];
  conversationId?: number;
  finalCheck: boolean;
  diseaseId?: number;
  stylePrompt: string;
  voiceName?: string;
  careSuggestions?: string[];
  roleName?: string;
}

// 定義後端回傳的響應介面
export interface AIChatResponse {
  conversationId?: number | number;
  responseText: string;
  isConversationEnd: boolean;
  currentStep: string;
  severity: string;
  finalAdvice?: string;
  showMapButton: boolean;
  shouldFinalize?: boolean;
  diseaseName?: string;
  diseaseId?: number;
  careSuggestions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiApiService {
  // 假設你的 AI 後端服務路由
  private apiUrl = `${environment.apiBaseUrl}/api/ai`;

  constructor(private http: HttpClient) { }

  /**
   * 發送用戶訊息給後端 AI 服務，並獲取回覆。
   * @param request 包含用戶訊息、用戶 ID、寵物 ID 和 AI 角色的請求物件。
   * @returns 包含 AI 回覆文字的 Observable。
   */
  sendMessage(request: AIChatRequest): Observable<AIChatResponse> {
    // 呼叫後端 /api/ai/chat 路由
    return this.http.post<AIChatResponse>(`${this.apiUrl}/chat`, request);
  }
}
