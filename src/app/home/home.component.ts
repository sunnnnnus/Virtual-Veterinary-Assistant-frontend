import { AuthApiService } from './../services/api/auth-api.service';
import { UserInputComponent } from './../user-input/user-input.component';
import { Component, OnInit , ViewChild} from '@angular/core';
import { OpeningContext, PetApiService } from '../services/api/pet-api.service';
import { filter } from 'rxjs/operators';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('popInPrompt', [
      transition(':enter', [
        animate('500ms ease-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.8) translateY(20px)', offset: 0 }),
          style({ opacity: 0.6, transform: 'scale(1.05) translateY(-5px)', offset: 0.7 }),
          style({ opacity: 1, transform: 'scale(1) translateY(0)', offset: 1 })
        ]))
      ])
    ])
  ]
})

export class HomeComponent implements OnInit {
  @ViewChild('userInput') userInputComponent!: UserInputComponent;
  isCollapsed = true;
  showHistory = false;
  history: any[] = [];
  isSidebarOpen = false;
  openingContext: any;
  openingPrompt: string='';
  hasTyped = false;

  constructor(
    private authApi :AuthApiService,
    private petApi : PetApiService
  ){}

  ngOnInit(): void {
    this.authApi.currentUserId$.pipe(
      filter(userId => !!userId) // 等待登入完成
    ).subscribe(userId => {
      const petId = this.authApi.getDefaultPetId();
      if (petId) {
        console.log('🐶 預設寵物 ID:', petId);
        this.petApi.getOpeningContext(petId).subscribe({
          next: (context) => {
            this.openingContext = context;
            this.openingPrompt = this.generateOpeningPrompt(context);
          },
          error: (err) => {
            console.warn('⚠️ 開場資料載入失敗:', err.message);
            this.openingPrompt = '請問毛孩今天哪裡不舒服呢？';
          }
        });
      } else {
        console.warn(`✅ 用戶 ${userId} 登入成功，但尚未選擇寵物`);
      }
    });
  }

  generateOpeningPrompt(context: OpeningContext): string {
    const { petName, lastDiagnosis } = context;
    let prompt = '';

    if (lastDiagnosis) {
      prompt = `${petName} 上次診斷是 ${lastDiagnosis.diseaseName}（${lastDiagnosis.severity}），`;
      prompt += lastDiagnosis.advice ? `我們${lastDiagnosis.advice}請問目前症狀有好轉嗎？` : '';
    } else {
      prompt = `${petName} 是第一次來看診，今天怎麼啦～`;
    }
    return prompt;
  }

  // 控制開場卡片
  onUserHasTyped() {
    this.hasTyped = true;
  }

   // **新增：處理「新聊天」按鈕點擊事件**
  startNewChat() {
    if (this.userInputComponent) {
      // 呼叫 UserInputComponent 裡面的 resetChat 方法
      this.userInputComponent.resetChat();
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
