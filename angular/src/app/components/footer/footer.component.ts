import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadmeComponent } from '../readme/readme.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{

  currentYear: string | undefined;

  constructor(public dialog: MatDialog,
              private renderer: Renderer2,
              private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.currentYear = this.getCurrentYear()
    this.startAnimation();
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

  openReadme(): void {
    let dialogWidth = '33%';
    let dialogHeight = '60%';
  
    if (window.innerWidth < 768) {
      dialogWidth = '95%';
      dialogHeight = '55%';
    }

    if (window.innerHeight < 768 && window.innerWidth < 768) {
      dialogWidth = '95%';
      dialogHeight = '75%';
    }
  
    this.dialog.open(ReadmeComponent, {
      width: dialogWidth,
      height: dialogHeight
    });
  }

  startAnimation() {
    const element = this.el.nativeElement.querySelector('.readme');
    this.renderer.setStyle(element, 'animation', 'animate 3s linear 2');

    setTimeout(() => {
      this.renderer.removeStyle(element, 'animation');
      setTimeout(() => {
        this.startAnimation();
      }, 10000);
    }, 6000);
  }

}
