import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AIRole } from 'src/app/ai-role/ai-role.component';

@Injectable({ providedIn: 'root' })
export class TtsApiService {
  private apiUrl = `${environment.apiBaseUrl}/api/tts`;
  constructor(
    private http: HttpClient
  ) {}

  play(text: string, role: AIRole): Promise<void> {
    const voiceName = role.voiceName || 'cmn-TW-Wavenet-A';

    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}`, { text, voiceName }, { responseType: 'arraybuffer' })
        .subscribe({
          next: audioBuffer => {
            const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.onended = () => resolve();     // 播放結束
            audio.onerror = () => reject();      // 播放失敗
            audio.play().catch(reject);          // 播放失敗（例如瀏覽器限制）
          },
          error: err => reject(err)              // API 請求失敗
        });

      console.log('前端送出的語音:', voiceName);
    });
  }
}
