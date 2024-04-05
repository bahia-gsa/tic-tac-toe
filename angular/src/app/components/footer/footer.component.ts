import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{

  currentYear: string | undefined;

  ngOnInit(): void {
    this.currentYear = this.getCurrentYear()
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

}
