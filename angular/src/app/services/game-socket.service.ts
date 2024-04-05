import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {

  //private url = 'ws://localhost:8080/game';
  private url = 'wss://quarkus-hkglgabtia-uc.a.run.app/game';


  private subject = new WebSocketSubject<Message>(this.url);
  
  private messages: Subject<Message> = new Subject<Message>();

  public messages$: Observable<Message> = this.messages.asObservable();


  public sendMessage(message: Message): void {
    this.subject.next(message);
  }

  public disconnect(): void {
    if (this.subject) {
      this.subject.complete();
    }
  }


  public connect(username: string, gameName: string): void {
    const urlWithUsername = `${this.url}/${gameName}/${username}`;
    this.subject = new WebSocketSubject<Message>(urlWithUsername);
    
    this.subject.subscribe({
      next: (message: Message) => this.messages.next(message),
      error: (error: Error) => console.error('WebSocket error:', error),
      complete: () => console.log('WebSocket connection closed')
    });
  }

}
export interface Message {
  sender: string;
  content: string;
  type: string;
}