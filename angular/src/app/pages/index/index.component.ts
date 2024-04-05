import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  @Output() nameEntered = new EventEmitter<string>();

  submitForm(nameForm: any) {
    let playerName = nameForm.value.name;
    this.nameEntered.emit(playerName);
  }

  
}
