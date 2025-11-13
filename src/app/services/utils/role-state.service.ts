import { Injectable } from '@angular/core';

export interface Role {
  name: string;
  avatar: string;
  stylePrompt: string;
  voiceName: string;
}

@Injectable({ providedIn: 'root' })
export class RoleStateService {
  private roles: Role[] = [
    {
      name: '溫暖喵喵',
      avatar: 'assets/images/溫暖喵喵.jpg',
      stylePrompt: '請用溫柔、親切、鼓勵的語氣回覆飼主，像是在安撫一位擔心的朋友。語句中可加入「別擔心」、「我們一起努力」、「牠會好起來的」等安撫詞彙，讓飼主感到安心與被照顧。',
      voiceName: 'zh-TW-HsiaoChenNeural'
    },
    {
      name: '專業邊牧',
      avatar: 'assets/images/專業邊牧.jpg',
      stylePrompt: '請用冷靜、專業、精準的語氣回覆飼主，像是在進行醫療判斷。語句中可加入「建議立即就醫」、「此症狀可能有風險」、「請務必留意」等判斷詞彙，強調醫療風險與行動指引。',
      voiceName: 'zh-CN-YunyangNeural'
    },
    {
      name: '活力小汪',
      avatar: 'assets/images/活力小汪.jpg',
      stylePrompt: '請用活潑、熱情、充滿希望的語氣回覆飼主，像是在鼓勵朋友振作起來。語句中可加入「加油加油」、「我們一起努力」、「牠一定會好起來的」等正向詞彙，讓飼主感受到能量與陪伴。',
      voiceName: 'zh-TW-YunJheNeural'
    }
  ];
  private currentRole: Role = this.roles[0]; // 預設角色

  getRoles(): Role[] {
    return this.roles;
  }

  getCurrentRole(): Role {
    return this.currentRole;
  }

  setCurrentRole(role: Role) {
    this.currentRole = role;
  }
}
