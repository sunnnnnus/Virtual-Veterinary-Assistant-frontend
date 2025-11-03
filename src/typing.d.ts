// 宣告瀏覽器原生的 SpeechRecognition 物件，讓 TypeScript 知道它們存在
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// 確保 SpeechRecognition 介面被正確識別
declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};
