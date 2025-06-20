import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {
  @Input() messages: string[] = ['Cargando...'];
  currentMessageIndex = 0;
  currentMessage = this.messages[0];

  ngOnInit(): void {
    if (!this.messages || this.messages.length === 0) {
      this.messages = ['Cargando...'];
    }

    this.currentMessage = this.messages[0];

    setInterval(() => {
      this.currentMessageIndex =
        (this.currentMessageIndex + 1) % this.messages.length;
      this.currentMessage = this.messages[this.currentMessageIndex];
    }, 2000);
  }
}
