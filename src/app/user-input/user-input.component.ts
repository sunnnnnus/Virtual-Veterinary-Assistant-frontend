import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { AiApiService, ChatMessage, AIChatRequest } from '../services/api/ai-api.service';
import { PetApiService, PetDetail } from '../services/api/pet-api.service';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { AuthApiService } from '../services/api/auth-api.service';
import { HistoryApiService } from '../services/api/history-api.service';
import { RoleStateService } from '../services/utils/role-state.service';
import { TtsApiService } from '../services/api/tts-api.service';

interface Role {
  name: string;
  avatar: string;
  stylePrompt: string;
  voiceName: string;
}

declare var webkitSpeechRecognition: any;

@Component({
  selector: 'app-user-input',
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css']
})
export class UserInputComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('chatWindow') private chatWindow!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef<HTMLTextAreaElement>;
  @Output() hasTyped = new EventEmitter<boolean>();

  userMessage = '';
  chatMessage: ChatMessage[] = [];
  isListening = false;
  isLoading = false;
  conversationId?: number;
  showMapButton = false;
  shouldFinalizeNext: boolean = false;
  showEndConsultationButton = false;
  autoEndTimer: any;
  userHasTyped = false;
  activeView: string = 'chat';
  confirmedDiseaseId: number | null = null;
  showFinalizeModal = false;
  showEmergencyModal: boolean = false;
  currentUserId: number | null = null;
  currentPet: PetDetail | null = null;
  isContextReady = false;
  currentRole: Role | null = null;
  careSuggestions: string[] = [];
  isPlaying = false; // 控制播放狀態
  currentPlayingMessageId: string | null = null;
  playingCardIndex: number | null = null;

  // 歷史紀錄管理
  history: Array<{
    id: number;
    conversationId?: number;
    title: string;
    severity: string;
    finalAdvice: string;
    diseaseName?: string;
    createdAt: Date;
  }> = [];
  activeRecordId: number | null = null;


  private authSubscription!: Subscription;

  private SpeechRecognition: any =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  supportsSpeechRecognition: boolean = !!this.SpeechRecognition;
  private recognition: any;

  @Input() petIdFromParent: number | null = null;
  @Input() openingPrompt: string = '';

  constructor(
    private aiApi: AiApiService,
    private petApi: PetApiService,
    private route: ActivatedRoute,
    private authService: AuthApiService,
    private historyApi : HistoryApiService,
    private roleState: RoleStateService,
    private ttsApi: TtsApiService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // 初始狀態
    this.currentPet = null;
    this.isContextReady = false;

    // 訂閱登入事件：處理登入成功後，頁面不刷新的情況
    this.authSubscription = this.authService.currentUserId$.pipe(
      filter(id => id !== null)
    ).subscribe(userId => {
      this.currentUserId = userId;

      // 登入成功後，如果 AuthService 有 defaultPetId，載入寵物
      const defaultPetId = this.authService.getDefaultPetId();
      if (defaultPetId) {
        this.loadPetDetail(defaultPetId);
      } else {
        // 沒有寵物的話，頁面可以解除鎖定，但仍無法聊天
        this.isContextReady = true;
        console.warn(`用戶 ${userId} 登入成功，但無寵物被選中。`);
      }
    });

    // 載入對應寵物
    this.route.paramMap.subscribe(params => {
      const petIdParam = params.get('petId');
      const targetPetId = petIdParam ? +petIdParam : null;

      if (targetPetId) {
        this.loadPetDetail(targetPetId);
      }
    });
    this.currentRole = this.roleState.getCurrentRole();
  }

/** 載入寵物詳細資料，並設置上下文狀態 */
private loadPetDetail(petId: number): void {
  this.isContextReady = false;

  this.petApi
    .getPetDetail(petId)
    .pipe(
      catchError(error => {
        console.error(`❌ Pet API 呼叫失敗 (ID: ${petId})`, error);
        return of(null as PetDetail | null);
      })
    )
    .subscribe({
      next: petDetail => {
        if (petDetail && petDetail.pId > 0) {
          this.currentPet = petDetail;
          this.petApi.setCurrentPetId(petDetail.pId);
        } else {
          this.currentPet = null;
        }
        this.isContextReady = true;
      },
      error: err => {
        console.error('致命錯誤：Load Pet Detail 訂閱失敗', err);
        this.currentPet = null;
        this.isContextReady = true;
      }
    });
}

updateInputPosition() {
  const inputWrapper = document.querySelector('.input-area-wrapper');
  const welcomeText = document.querySelector('.welcome-text');
  const hasMessages = this.chatMessage.length > 0;

  if (inputWrapper && welcomeText) {
    if (hasMessages) {
        inputWrapper.classList.remove('centered');
        inputWrapper.classList.add('sticky');
        welcomeText.classList.add('hidden');

    } else {
        inputWrapper.classList.add('centered');
        inputWrapper.classList.remove('sticky');
        welcomeText.classList.remove('hidden');
    }
  }
}

// 儲存歷史紀錄
private saveCurrentConversation() {
  const finalAdvice = this.chatMessage.find(m => m.aiSummary)?.aiSummary || '';
  const lastMsg = this.chatMessage[this.chatMessage.length - 1];
  const severity = lastMsg?.severity || '未知';
  const timestamp = new Date().toISOString();

  this.historyApi.saveConversationHistory({
      petId: this.currentPet.pId,
      title: `${this.currentPet.pName}`,
      severity,
      finalAdvice,
      diseaseId: this.confirmedDiseaseId && this.confirmedDiseaseId > 0
        ? this.confirmedDiseaseId
        : 9999,
      timestamp,
      messages: this.chatMessage.map(m => ({
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp || new Date()
      }))
    }).subscribe({
      next: (res) => {
        this.historyApi.notifyHistoryUpdated();
        this.resetChat();
        this.activeView = 'history';
      },
      error: (err) => {
        console.warn('❌ 儲存問診紀錄失敗:', err);
        this.activeView = 'history';
      }
    });
  }

  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

/** 統一處理文字輸入與發送*/
sendMessage() {
  const finalCheckToSend = this.shouldFinalizeNext;
  if (!this.userMessage.trim() || this.isLoading) return;

  this.updateInputPosition();

  if (this.currentUserId === null || this.currentPet === null || this.currentRole === null || !this.isContextReady) {
    console.error('❌ 無法發送：請先選擇一個寵物以開始聊天。');
    this.isLoading = false;
    return;
  }

  const userMsgText = this.userMessage.trim();
  this.userMessage = '';
  this.hasTyped.emit(true);
  this.isLoading = true;

  // 將使用者訊息加入歷史聊天
  this.chatMessage.push({
    id: this.generateUniqueId(),
    sender: 'user',
    text: userMsgText,
    timestamp: new Date(),
    showMapButton: false
  });

  this.scrollToBottom();
  this.updateInputPosition();

  // AI request
  const request: AIChatRequest = {
    userId: this.currentUserId!,
    petId: this.currentPet!.pId,
    message: userMsgText,
    conversationId: this.conversationId, // 保留上下文
    finalCheck: finalCheckToSend,
    stylePrompt: this.currentRole!.stylePrompt,
    voiceName: this.currentRole!.voiceName,
    roleName: this.currentRole!.name
  };

  this.aiApi.sendMessage(request).subscribe({
    next: (response) => {
      const shouldFinalize = response.shouldFinalize || false;
      this.shouldFinalizeNext = shouldFinalize;

      // 更新 conversationId
      this.conversationId = response.conversationId;

      this.confirmedDiseaseId = response.diseaseId ?? 9999;
      if (!this.confirmedDiseaseId || this.confirmedDiseaseId <= 0) {
        console.warn('⚠️ AI 回覆缺少有效 diseaseId，儲存可能失敗');
      }


      // 推入 AI 訊息
      this.chatMessage.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: response.responseText,
        timestamp: new Date(),
        conversationId: response.conversationId,
        aiSummary: response.finalAdvice || '',
        showMapButton: response.showMapButton || false,
        severity: response.severity,
        diseaseName: response.diseaseName
      });

      this.scrollToBottom();
      this.isLoading = false;
      this.updateInputPosition();

      const lastAiMsg = [...this.chatMessage].reverse().find(m => m.sender === 'ai');
      const severity = lastAiMsg?.severity || '未知';

      // 結束問診流程
      if (response.currentStep === 'provide_advice' || response.isConversationEnd) {
        this.careSuggestions = response.careSuggestions || [];

        if (severity === '高') {
          this.openEmergencyModal();
        } else {
          this.openFinalizeModal();
        }
      }
    },

    error: (err) => {
      console.error('AI 助理回覆失敗:', err);

      this.chatMessage.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: '目前系統暫時無法取得 AI 回覆，請稍後再試或重新輸入訊息。',
        timestamp: new Date(),
        aiSummary: '',
        showMapButton: false
      });

      this.isLoading = false;
      this.scrollToBottom();
      this.updateInputPosition();
    }
  });
}

adjustTextareaHeight() {
  const textarea = this.chatInput.nativeElement;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}


ngAfterViewChecked() {
  this.scrollToBottom();
}

ngOnDestroy(): void {
  if (this.authSubscription) {
    this.authSubscription.unsubscribe();
  }
}

  /** 清空聊天紀錄與輸入框 */
  public resetChat() {
    this.chatMessage = [];
    this.userMessage = '';
    this.shouldFinalizeNext = false;
    this.conversationId = Date.now(); // 重新產生新的對話 ID

    // 停止語音輸入
    if (this.isListening) this.stopListening();

    // 顯示初始提示文字
    const welcomeText = document.querySelector('.welcome-text');
    if (welcomeText) {
      welcomeText.classList.remove('hidden');
    }

    // 將輸入框回到畫面中央
    const inputWrapper = document.querySelector('.input-area-wrapper');
    if (inputWrapper) {
      inputWrapper.classList.add('centered');
      inputWrapper.classList.remove('sticky');
    }

    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      this.chatWindow.nativeElement.scrollTop =
        this.chatWindow.nativeElement.scrollHeight;
    } catch {}
  }

  // ============== 語音輸入邏輯 ==============

  toggleSpeechInput() {
    if (!this.supportsSpeechRecognition) return;
    this.isListening ? this.stopListening() : this.startListening();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    this.isListening = false;
    if (this.userMessage === '...') this.userMessage = '';
  }

  startListening() {
    this.isListening = true;
    this.userMessage = '...';
    this.recognition = new this.SpeechRecognition();
    this.recognition.lang = 'zh-TW';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
      }

      this.zone.run(() => {
        this.userMessage = finalTranscript;
        this.isListening = false;
      });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.userMessage === '...') {
        this.userMessage = '';
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('語音辨識錯誤:', event.error);
      this.isListening = false;
      alert('語音輸入失敗，請重試。');
    };

    this.recognition.start();
  }

  // ============== 文字發送邏輯 ==============
  sendText(text: string = this.userMessage) {
    const cleanedText = text.trim();
    if (cleanedText && !this.isListening) {
      this.sendMessage();
      this.userMessage = '';
    }
  }

  // ============== 結束彈窗 ==============
  openFinalizeModal() {
    setTimeout(() => {
      this.showFinalizeModal = true;
      document.body.style.overflow = 'hidden';
    }, 20000);
  }

  cancelFinalize() {
    this.showFinalizeModal = false;
    document.body.style.overflow = '';
  }

  confirmFinalize() {
    this.showFinalizeModal = false;
    document.body.style.overflow = '';
    const lastMsg = [...this.chatMessage].reverse().find(m => m.sender === 'ai');

    const newRecord = {
      id: this.history.length + 1,
      conversationId: this.conversationId,
      title: `${this.currentPet?.pName}`,
      diseaseName: lastMsg?.diseaseName || '未命名疾病',
      severity: lastMsg?.severity || '未知',
      finalAdvice: lastMsg?.aiSummary || '',
      createdAt: new Date(),
      aiSummary: lastMsg?.aiSummary || ''
    };

    this.history.push(newRecord);
    this.activeRecordId = newRecord.id;
    this.saveCurrentConversation();
    this.resetChat(); // 清空狀態並開始新問診
  }

  openEmergencyModal() {
    setTimeout(() => {
      this.showEmergencyModal = true;
      document.body.style.overflow = 'hidden';
    }, 20000);
  }

  openGoogleMap() {
    const query = '獸醫院 營業中';
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');

    this.confirmFinalize();
    this.showEmergencyModal = false;
    document.body.style.overflow = '';
  }

  cancelEmergency() {
    this.confirmFinalize();
    this.showEmergencyModal = false;
    document.body.style.overflow = '';
  }

  // ============== 語音輸出 ==============
  onPlay(msg: ChatMessage) {
    const role = this.roleState.getCurrentRole();
    if (this.isPlaying) {
      this.ttsApi.pause();
      this.isPlaying = false;
    } else {
      this.isPlaying = true;
      this.ttsApi.play(msg.text, role).finally(() => {
        this.isPlaying = false;
      });
    }
  }

  onPlayCard(index: number, text: string, role: Role): void {
    if (this.playingCardIndex === index) {
      this.ttsApi.pause();
      this.playingCardIndex = null;
    } else {
      this.playingCardIndex = index;
      this.ttsApi.play(text, role).finally(() => {
        this.playingCardIndex = null;
      });
    }
  }

}


