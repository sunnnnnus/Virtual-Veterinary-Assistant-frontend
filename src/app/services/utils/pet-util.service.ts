import { Injectable } from '@angular/core';
import * as SpeciesMapData from '../../../assets/species-map.json';

// 預期的 JSON 結構型別
interface SpeciesMap {
    [key: string]: string[];
}

@Injectable({
    providedIn: 'root'
})
export class PetUtilService {

    // 儲存品種到物種的查找表 (e.g., { "柴犬": "Dog", "波斯貓": "Cat", ... })
    private lookupTable: { [breed: string]: string } = {};

    // 處理 JSON 檔案匯入的標準方式
    private speciesMap: SpeciesMap = (SpeciesMapData as any).default || SpeciesMapData;

    constructor() {
        // 服務初始化時，建立查找表，只執行一次
        this.lookupTable = this.createReverseLookup(this.speciesMap);
        console.log('✅ PetUtilService 啟動：已載入品種查找表。');
    }

    /**
     * 從 SpeciesMap (JSON 結構) 建立一個高效的反向查找表。
     * 鍵：小寫的品種名稱；值：物種名稱 (Dog/Cat/...)
     */
    private createReverseLookup(map: SpeciesMap): { [breed: string]: string } {
        const reverseMap: { [breed: string]: string } = {};
        for (const species in map) {
            if (map.hasOwnProperty(species)) {
                map[species].forEach(breed => {
                    // 將品種名稱轉為小寫，去除空格，確保查找時不區分大小寫
                    const cleanedBreed = breed.toLowerCase().trim();
                    reverseMap[cleanedBreed] = species;
                });
            }
        }
        return reverseMap;
    }

    /**
     * 根據具體的寵物品種名稱，查找其所屬的通用物種。
     * @param breedName - 寵物的品種名稱 (e.g., '比熊犬')
     * @returns 所屬物種 (e.g., 'Dog', 'Cat' 或 'Unknown')
     */
    getSpeciesByBreed(breedName: string | null | undefined): string {
        if (!breedName) {
            return 'Unknown';
        }

        const cleanedBreed = breedName.toLowerCase().trim();

        // 使用反向查找表進行查找，如果找不到則回傳 'Unknown'
        return this.lookupTable[cleanedBreed] || 'Unknown';
    }
}
