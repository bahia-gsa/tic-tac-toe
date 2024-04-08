import { Component } from '@angular/core';

@Component({
  selector: 'app-readme',
  templateUrl: './readme.component.html',
  styleUrls: ['./readme.component.scss']
})
export class ReadmeComponent {

  openGithub(): void {
    window.open('https://github.com/bahia-gsa/tic-tac-toe/')
  }

  openLinkedin(): void {
    window.open('https://www.linkedin.com/in/schaedler-almeida/')
  }

}
