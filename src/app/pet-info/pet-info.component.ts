import { AuthApiService } from '../services/api/auth-api.service';
import { Component, OnInit } from '@angular/core';
import { PetUtilService } from '../services/utils/pet-util.service';
import { PetApiService, PetDetail } from '../services/api/pet-api.service';

@Component({
  selector: 'app-pet-info',
  templateUrl: './pet-info.component.html',
  styleUrls: ['./pet-info.component.css']
})
export class PetInfoComponent implements OnInit {

  // 假設的資料
  //pet: any = { name: '果醬', sex:'公', species: '比熊' , age: 2};

  pet: PetDetail | null = null;
  isLoading : boolean = true;

  // 1. 透過建構函式注入 PetUtilService
  constructor(
    private petUtil: PetUtilService,
    private petApi: PetApiService,
    private authService: AuthApiService
  ) { }

  ngOnInit(): void {
    // 2. 元件初始化時，載入寵物資料
    const currentUserId = this.authService.getCurrentUserId();

    if (currentUserId) {
      // 2. 使用當前登入用戶的 ID 來載入寵物資料
      this.loadUserPets(currentUserId);
    } else {
      console.error('未找到當前登入用戶的 ID');
      this.isLoading = false;
      // 導向登入頁面或顯示錯誤
    }
  }


    /**
   * 載入當前用戶的所有寵物列表，並將第一個寵物設為顯示寵物。
   * @param userId 當前登入的用戶 ID
   */
  loadUserPets(userId: number): void {
    this.isLoading = true;

    // 呼叫正確的 API 服務方法
    this.petApi.getPetsByUserId(userId).subscribe({
      next: (pets: PetDetail[]) => {
        if (pets && pets.length > 0) {
          // 假設 PetInfoComponent 只顯示列表中的第一隻寵物
          // 由於 getPetsByUserId 只回傳 PetSummary，這裡進行類型斷言，以便顯示。
          this.pet = pets[0] as PetDetail;
          console.log('用戶首個寵物資料載入成功:', this.pet);
        } else {
          console.log('該用戶尚未建立任何寵物資料。');
          this.pet = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入寵物列表失敗:', err);
        this.pet = null;
        this.isLoading = false;
      }
    });
  }

  /**
   * 根據寵物的品種名稱 (現在命名為 species)，回傳對應的頭像圖片路徑。
   * @param breedName - 寵物的品種名稱 (e.g., '柴犬')
   * @returns 圖片的相對路徑
   */
  // ⚠️ 修正這裡：函式簽名依然傳入品種名稱，但我們知道它對應 pet.species
  getPetAvatar(breedName: string | null | undefined): string {

    // 呼叫服務，取得標準化物種 (例如: 'Dog', 'Cat', 或 'Unknown')
    const species = this.petUtil.getSpeciesByBreed(breedName);

    switch (species) {
      case 'Dog':
        return 'assets/images/dog.jpg';

      case 'Cat':
        return 'assets/images/cat.png';

      default:
        return 'assets/images/default.jpg';
    }
  }

}
