import { Component, OnInit } from '@angular/core';
import { HistoryApiService } from '../services/api/history-api.service';
import { PetApiService } from '../services/api/pet-api.service';

@Component({
  selector: 'app-history-record',
  templateUrl: './history-record.component.html',
  styleUrls: ['./history-record.component.css']
})
export class HistoryRecordComponent implements OnInit {
  history: any[] = [];
  activeRecordId: number | null = null;
  currentPetId: number = 1;


  constructor(
    private historyApi: HistoryApiService,
    private petApi: PetApiService
  ) {}

  ngOnInit(): void {
    this.petApi.getCurrentPetId().subscribe((pId) => {
      if (pId) {
        this.currentPetId = pId;
        this.loadHistory();
      }
    });


    // 監聽更新通知
    this.historyApi.onHistoryUpdated().subscribe(() => {
      this.loadHistory();
    });
  }

  loadHistory(): void {
    this.historyApi.getConversationHistory(this.currentPetId).subscribe({
      next: (data) => {
        this.history = data;
      },
      error: (err) => {
        console.warn('載入歷史紀錄失敗:', err);
      }
    });
  }
}
