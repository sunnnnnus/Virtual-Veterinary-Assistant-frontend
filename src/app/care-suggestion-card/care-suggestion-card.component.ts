import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-care-suggestion-card',
  templateUrl: './care-suggestion-card.component.html',
  styleUrls: ['./care-suggestion-card.component.css']
})
export class CareSuggestionCardComponent {
  @Input() suggestions: string[] = [];
  @Input() voiceName: string = '';
  @Input() isPlaying: boolean = false;

  @Output() playRequested = new EventEmitter<void>();

  requestPlay(): void {
    this.playRequested.emit();
  }

}
