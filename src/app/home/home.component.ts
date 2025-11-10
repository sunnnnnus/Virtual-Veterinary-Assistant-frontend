import { UserInputComponent } from './../user-input/user-input.component';
import { Component, OnInit , ViewChild} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('userInput') userInputComponent!: UserInputComponent;
  isCollapsed = true;
  showHistory = false;
  history: any[] = [];
  isSidebarOpen = false;

  constructor(){}

  ngOnInit(): void {

  }
   // **新增：處理「新聊天」按鈕點擊事件**
  startNewChat() {
    if (this.userInputComponent) {
      // 呼叫 UserInputComponent 裡面的 resetChat 方法
      this.userInputComponent.resetChat();
      console.log('➡️ 開始新的聊天：輸入框和紀錄已清空。');
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isCollapsed) {
      this.showHistory = false;
    }
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  toggleHistoryWhenCollapsed() {
    this.isCollapsed = false;
    this.showHistory = true;
  }


}
