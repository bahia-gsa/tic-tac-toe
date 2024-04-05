import { Component } from '@angular/core';

@Component({
  selector: 'app-typing-effect',
  templateUrl: './typing-effect.component.html',
  styleUrls: ['./typing-effect.component.scss']
})
export class TypingEffectComponent {
  phrases = ['challenge other players...', 'accept a challenge...', 'have fun !!'];
  displayedTexts: string[] = ['', '', ''];
  currentPhraseIndex = 0;

  ngOnInit() {
    this.typePhrase();
  }

  typePhrase() {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < this.phrases[this.currentPhraseIndex].length) {
        this.displayedTexts[this.currentPhraseIndex] += this.phrases[this.currentPhraseIndex][i];
        i++;
      } else {
        clearInterval(intervalId);
        this.currentPhraseIndex++;
        if (this.currentPhraseIndex < this.phrases.length) {
          this.typePhrase();
        }
      }
    }, 100);
  }

}
