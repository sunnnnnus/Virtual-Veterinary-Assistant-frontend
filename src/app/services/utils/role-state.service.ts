import { Injectable } from '@angular/core';

export interface Role {
  name: string;
  avatar: string;
  stylePrompt: string;
  voiceName: string;
}

@Injectable({ providedIn: 'root' })
export class RoleStateService {
  private currentRole: Role = {
    name: '溫柔助理',
    avatar: 'assets/溫柔狗狗助理.jpg',
    stylePrompt: '請用溫柔、親切、鼓勵的語氣回覆飼主，讓他感到安心與被照顧。',
    voiceName: 'cmn-TW-Wavenet-A'
  };

  getCurrentRole(): Role {
    return this.currentRole;
  }

  setCurrentRole(role: Role) {
    this.currentRole = role;
  }
}
