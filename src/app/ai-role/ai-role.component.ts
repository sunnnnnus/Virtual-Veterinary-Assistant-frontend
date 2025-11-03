import { Component } from '@angular/core';
import { RoleStateService } from '../services/utils/role-state.service';

export interface AIRole {
  name: string;
  avatar: string;
  stylePrompt: string;
  voiceName: string;
}

@Component({
  selector: 'app-ai-role',
  templateUrl: './ai-role.component.html',
  styleUrls: ['./ai-role.component.css'],
})
export class AiRoleComponent {

  constructor(private roleState: RoleStateService) {}

  roles: AIRole[] = [
    {
      name: '溫柔助理',
      avatar: 'assets/溫柔狗狗助理.jpg',
      stylePrompt:
        '請用溫柔、親切、鼓勵的語氣回覆飼主，像是在安撫一位擔心的朋友。語句中可加入「別擔心」、「我們一起努力」、「牠會好起來的」等安撫詞彙，讓飼主感到安心與被照顧。',
      voiceName: 'cmn-TW-Wavenet-A'
    },
    {
      name: '專業助理',
      avatar: 'assets/嚴肅狗狗助理.jpg',
      stylePrompt:
        '請用專業、精準、直接的語氣回覆飼主，像是在進行醫療判斷。語句中可加入「建議立即就醫」、「此症狀可能有風險」、「請務必留意」等判斷詞彙，強調醫療風險與行動指引。',
      voiceName: 'cmn-TW-Wavenet-C'
    },
  ];

  currentRole: AIRole = this.roles[0]; // 預設溫柔助理
  showOtherRole = false;

  toggleOtherRole() {
    this.showOtherRole = !this.showOtherRole;
  }

  selectRole(role: AIRole) {
    this.currentRole = role; // 改變目前角色
    this.roleState.setCurrentRole(role);
    this.showOtherRole = false; // 隱藏其他選項
  }

  get otherRoles(): AIRole[] {
    return this.roles.filter((r) => r.name !== this.currentRole.name);
  }
}
