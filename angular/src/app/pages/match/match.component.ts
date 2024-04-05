import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { Message, UserSocketService } from 'src/app/services/user-socket.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit{

  @Input() gameId: string = '';
  @Output() gameOver = new EventEmitter<string>();
  playerName: string = '';
  listPlayers: { name: string, score: number }[] = [];
  myTurn: boolean = false;
  whoStarts: string = '';
  winner: string = '';
    board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];
  

  constructor(private gameSocketService : GameSocketService,
              private userSocketService: UserSocketService,) { }
  
  
  ngOnInit(): void {

    this.playerName = sessionStorage.getItem('playerName') ?? '';
  
    if (this.playerName !== '') this.connectToGame(this.playerName);
  
    this.gameSocketService.messages$.subscribe((message) => {
      console.log('Received message:', message);
      this.getPlayers(message);

      this.markOnBoard(message)
      this.readWinnerMessage(message);
      this.checkWhoseTurn(message);
      this.checkForDraw(message);
      console.log('List of players:', this.listPlayers);
    });
    

  }

  getPlayers(message: any){
    if (!message.hasOwnProperty('type')) {
      this.listPlayers = message.map((encodedName: string) => {
        return {
            name: decodeURIComponent(encodedName),
            score: 0

        };
      });
    }
  }

  connectToGame(playerName: string) {
    this.gameSocketService.connect(this.playerName, this.gameId);
  }

  backToHall() {
    this.gameSocketService.disconnect();
    this.listPlayers = [];
    this.gameOverEvent();

  }

  private gameOverEvent() {
    this.userSocketService.sendMessage({ sender: this.playerName, content: 'from game', type: 'disconnected' });
    this.gameOver.emit('game over');
  }


  whoBegins(): void {
    const randomIndex = Math.floor(Math.random() * this.listPlayers.length);
    const whoBegins = this.listPlayers[randomIndex].name;
    console.log('whoBegins:', whoBegins);
    const message: Message = { sender: this.playerName, content: whoBegins, type: "whoBegins"};
    this.gameSocketService.sendMessage(message);
    this.whoStarts = whoBegins;
    if (whoBegins === this.playerName) {
      this.myTurn = true;
    }
  }

  checkWhoseTurn(message: Message): void {
    if (message.type === 'move' && message.sender !== this.playerName) {
      this.myTurn = true;
    }
    if (message.type === 'whoBegins') {
      console.log('turn of ', message.content);
      this.whoStarts = message.content;
      if (message.content === this.playerName) {
        this.myTurn = true;
      }

    }
  }

  mark(coordinate: string): void {
    if (!this.myTurn) {
      console.log('Not your turn');
      return;
    }
    if (coordinate) {
      const message: Message = { sender: this.playerName, content: coordinate, type: "move"};
      this.gameSocketService.sendMessage(message);
    }
    this.myTurn = !this.myTurn
    this.markOnOwnBoard(coordinate);
    const winner = this.checkWinner();
    if (winner !== null) {
      console.log('Winner:', winner);
      this.messageWinner(winner);
    }
    if (this.isBoardCompleted()) {
      console.log('Board is completed');
      this.messageDraw();
    }
  }

  markOnBoard(message: Message): void {
    switch (message.content) {
      case '1':
        this.board[0][2] = message.sender;
        break;
      case '2':
        this.board[0][1] = message.sender;
        break;
      case '3':
        this.board[0][0] = message.sender;
        break;
      case '4':
        this.board[1][2] = message.sender;
        break;
      case '5':
        this.board[1][1] = message.sender;
        break;
      case '6':
        this.board[1][0] = message.sender;
        break;
      case '7':
        this.board[2][2] = message.sender;
        break;
      case '8':
        this.board[2][1] = message.sender;
        break;
      case '9':
        this.board[2][0] = message.sender;
        break;
      default:
        break;
    }
  }
  markOnOwnBoard(coordinate: string): void {
  switch (coordinate) {
      case '1':
        this.board[0][2] = this.playerName;
        break;
      case '2':
        this.board[0][1] = this.playerName;
        break;
      case '3':
        this.board[0][0] = this.playerName;
        break;
      case '4':
        this.board[1][2] = this.playerName;
        break;
      case '5':
        this.board[1][1] = this.playerName;
        break;
      case '6':
        this.board[1][0] = this.playerName;
        break;
      case '7':
        this.board[2][2] = this.playerName;
        break;
      case '8':
        this.board[2][1] = this.playerName;
        break;
      case '9':
        this.board[2][0] = this.playerName;
        break;
      default:
        break;
    }
  }

  checkWinner(): string | null {
    // Check rows, columns, and diagonals for a winner
    for (let i = 0; i < 3; i++) {
      // Check rows
      if (this.checkLine(this.board[i][0], this.board[i][1], this.board[i][2], this.playerName)) {
        return this.playerName;
      }
      // Check columns
      if (this.checkLine(this.board[0][i], this.board[1][i], this.board[2][i], this.playerName)) {
        return this.playerName;
      }
    }
    // Check diagonals
    if (this.checkLine(this.board[0][0], this.board[1][1], this.board[2][2], this.playerName)) {
      return this.playerName;
    }
    if (this.checkLine(this.board[0][2], this.board[1][1], this.board[2][0], this.playerName)) {
      return this.playerName;
    }
    // No winner yet
    return null;
  }

  checkLine(a: string, b: string, c: string, playerName: string): boolean {
    return a === playerName && a === b && a === c;
  }

  isBoardCompleted(): boolean {
    for (let row of this.board) {
      for (let cell of row) {
        if (cell === '') {
          return false; 
        }
      }
    }
    return true;
  }

  messageDraw(): void {
    const message: Message = { sender: this.playerName, type: "draw", content: 'draw' };
    this.gameSocketService.sendMessage(message);
    console.log('Sent draw message:', message);
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.winner = 'draw';
    this.myTurn = false;
    this.whoStarts = '';
    setTimeout(() => {
      this.winner = '';
    }, 3000);
  }

  checkForDraw(message: Message): void {
    if (message.type === 'draw') {
      this.board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
      this.winner = 'draw';
      this.myTurn = false;
      this.whoStarts = '';
      setTimeout(() => {
        this.winner = '';
      }, 3000);
    }
  }

  messageWinner(winner: string): void {
    const message: Message = { sender: this.playerName, type: "winner", content: winner };
    this.gameSocketService.sendMessage(message);
    console.log('Sent winner message:', message);
    let player = this.listPlayers.find(player => player.name === winner);
    if (player) {
      player.score ++;
    } 
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.winner = winner;
    this.myTurn = false;
    this.whoStarts = '';
    setTimeout(() => {
      this.winner = '';
    }, 3000);
  }

  readWinnerMessage(message: Message): void {
    if (message.type === 'winner') {
      let player = this.listPlayers.find(player => player.name === message.content);
      if (player) {
        player.score ++;
    }
      this.board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
      this.winner = message.content;
      this.myTurn = false;
      this.whoStarts = '';
      setTimeout(() => {
        this.winner = '';
      }, 3000);
    }
  }

  getOtherPlayerName(): string {
    const otherPlayer = this.listPlayers.find(player => player.name !== this.playerName);
    return otherPlayer ? otherPlayer.name : '';
  }

}
