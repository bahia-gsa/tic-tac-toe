import { Component, OnInit } from '@angular/core';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { Message, UserSocketService } from 'src/app/services/user-socket.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-player-connected',
  templateUrl: './player-connected.component.html',
  styleUrls: ['./player-connected.component.scss']
})
export class PlayerConnectedComponent implements OnInit{

  playerName: string = '';
  //playerName: string = 'Teste';
  listPlayers: { name: string, gameName: string }[] = [];
  listChallenges: { name: string, gameId: string }[] = [];
  openMatch: boolean = false;
  gameId: string = '';
  isMobile: boolean = false;
  showTooltip = false;



  constructor(private userSocketService: UserSocketService,
              private gameSocketService: GameSocketService,
              private breakpointObserver: BreakpointObserver) { 
                this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
                  this.isMobile = result.matches;
                });
              }
  
  
  ngOnInit(): void {

    this.userSocketService.messages$.subscribe((message) => {
      console.log('Received message:', message);
      this.getConnectedUsers(message);
      this.checkforGameAccepted(message);
      this.checkforChallenge(message);
      this.checkForDisconnectedFromGame(message);
      console.log('List of players:', this.listPlayers);
    });
  }


  getConnectedUsers(message: Message) {
    if (message.type === 'users') {
      const listUsers = message.content.split(', ');
      console.log('Parsed listUsers:', listUsers);
      this.listPlayers = listUsers.map((encodedName: string) => {
        return {
            name: decodeURIComponent(encodedName),
            gameName: ''

        };
      });
    }
  }


  challenge(player: string) {
    let gameId = Math.random().toString(36).substr(2, 6);
    this.gameId = gameId;
    this.userSocketService.sendMessage({sender: this.playerName, content: gameId, type: 'challenge', to: player});
  }

  checkforChallenge(message: Message) {
    if (message.type === 'challenge' && message.to === this.playerName) {
      this.listChallenges.push({name: message.sender, gameId: message.content});
      console.log('listChallenge:', this.listChallenges);
      }
  }

  acceptChallenge(gameId: string) {
    this.userSocketService.sendMessage({sender: this.playerName, content: gameId, type: 'gameAccepted'});
    this.listChallenges = this.listChallenges.filter(challenge => challenge.gameId !== gameId);
    sessionStorage.setItem('playerName', this.playerName);
    this.openMatch = true;
    this.gameId = gameId;
  }


  checkforGameAccepted(message: Message) {
    if (message.type === 'gameAccepted' && message.content === this.gameId) {
      sessionStorage.setItem('playerName', this.playerName);
      this.openMatch = true;
      this.gameId = message.content;
    }
  }

  checkForDisconnectedFromGame(message: Message) {
    if (message.type === 'disconnected' && message.content === "from game") {
      this.gameSocketService.disconnect();
      this.openMatch = false;
    }
  }

  handleNameEntered(name: string) {
    this.playerName = name;
    sessionStorage.setItem('playerName', this.playerName);
    this.userSocketService.connect(this.playerName);
  }

  checkForGameOver(data: string) {
    console.log('Game over:', data);
    this.openMatch = false;  
  }

}
