import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Role } from '../utils/role-state.service'

@Injectable({ providedIn: 'root' })
export class TtsApiService {
  private apiUrl = `${environment.apiBaseUrl}/api/tts`;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(private http: HttpClient) {}

  play(text: string, role: Role): Promise<void> {
    const voiceName = role.voiceName || 'zh-TW-HsiaoChenNeural';

    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}`, { text, voiceName }, { responseType: 'arraybuffer' })
        .subscribe({
          next: audioBuffer => {
            const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            this.currentAudio = audio;

            audio.onended = () => resolve();
            audio.onerror = () => reject();
            audio.play().catch(reject);
          },
          error: err => reject(err)
        });
    });
  }

  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}
