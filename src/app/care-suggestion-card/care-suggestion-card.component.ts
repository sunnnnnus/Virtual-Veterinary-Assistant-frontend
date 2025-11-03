import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-care-suggestion-card',
  templateUrl: './care-suggestion-card.component.html',
  styleUrls: ['./care-suggestion-card.component.css']
})
export class CareSuggestionCardComponent {
  isPlaying: boolean = false;

  @Input() suggestions: string[] = [];
  @Input() voiceName: string = '';

  @Output() playRequested = new EventEmitter<void>();

  requestPlay(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playRequested.emit();
  }
}
