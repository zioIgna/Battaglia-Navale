import { Injectable, OnInit } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { PlayerComponent } from './player/player.component';
import { Subject, Subscription } from 'rxjs';
import { ConnectionService } from 'src/app/connection.service';
import { UsersService } from 'src/app/users/users.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BattleService implements OnInit {

  activePlayers: string[] = [];
  private activePlayersSub: Subscription;
  private boards: BoardComponent[] = [];
  private boardsListener = new Subject<BoardComponent[]>();
  boardSize = 10;
  currPlayer = 0;
  endGame = false;
  hits = 0;
  hitsToWin = 0;
  myBattle: string[] = [];
  orientation = 'vertical';
  private orientationListener = new Subject<string>();
  playersNumber = 2;
  positionedShips = 0;
  // private activePlayersListener = new Subject<string[]>();

  constructor(private connection: ConnectionService, private usersService: UsersService, private router: Router) { }

  ngOnInit() {
    this.activePlayers = this.usersService.activePlayers;
    this.activePlayersSub = this.usersService.getActivePlayersListener()
      .subscribe(newActivePlayers => this.activePlayers = newActivePlayers);
  }

  getBoards() {
    // return [...this.boards];
    return this.boards;
  }

  setBoards(newBoards: BoardComponent[]) {
    this.boards = newBoards;
  }

  getBoardsListener() {
    return this.boardsListener.asObservable();
  }

  sendBoardsListener(newBoards) {
    this.boardsListener.next(newBoards);
  }

  getOrientationListener() {
    return this.orientationListener.asObservable();
  }

  sendOrientationListener(newOrientation) {
    this.orientationListener.next(newOrientation);
  }

  // sendActivePlayers(newActivePlayers) {
  //   this.activePlayersListener.next(newActivePlayers);
  // }

  // getActivePlayersListener() {
  //   return this.activePlayersListener.asObservable();
  // }

  createBoards(players) {
    this.myBattle = [...players.nowPlaying];
    for (let i = 0; i < this.playersNumber; i++) {
        const player = new PlayerComponent();
        player.id = i;
        player.score = 0;
        const board = new BoardComponent();
        board.player = player;
        console.log('lo score di questo player è: ' + player.score);
        board.tiles = this.setTiles();
        this.boards.push(board);
    }
    this.boardsListener.next([...this.boards]);
    this.usersService.getLoggedEmail() === players.nowPlaying[0] ? this.connection.binaryId = 0 : this.connection.binaryId = 1;
    this.connection.sendId(this.connection.binaryId);
    console.log('Questa è la binaryId:  ' + this.connection.binaryId);
    this.router.navigate(['/battle']);
    for (const ship of this.boards[this.connection.binaryId].player.shipsToPlace) {
      this.hitsToWin += ship.size;
    }
    console.log('hitsToWin = ' + this.hitsToWin);
  }

  setTiles() {
    const tiles = [];
    for (let i = 0; i < this.boardSize; i++) {
        tiles[i] = [];
        for (let j = 0; j < this.boardSize; j++) {
            tiles[i][j] = { used: false, value: '0', shipId: '' };
        }
    }
    return tiles;
  }

  startBattle(game) {
    const players = {nowPlaying: [game, this.usersService.getLoggedEmail()]};
    console.log('Questi sono i players passati: ' + players.nowPlaying);
    this.connection.socket.emit('start battle', players);
    // this.createBoards();
  }

  getMyBattle() {
    return JSON.stringify(this.myBattle);
  }

  getPosition(e: any) {
    console.dir(e.target);
    console.log(e.target.id);
    console.log(e.target.title);
    console.log('variabile myBattle = ' + this.myBattle);
    console.log('questa è myBattle parsata: ' + JSON.parse(e.target.title));
    if (JSON.parse(e.target.title).includes(this.usersService.getLoggedEmail())) {
      console.log('Riuscito!');
    }

    const id = e.target.id;
    const boardId = +(id.substring(1, 2));
    const row = +(id.substring(2, 3));
    const col = +(id.substring(3, 4));
    const tile = this.boards[boardId].tiles[row][col];
    const ship = { boardId: boardId, row: row, col: col };
    alert('La casella è: ' + JSON.stringify(id) + ' used: ' + JSON.stringify(tile.used) + ' shipId: ' + tile.shipId);
    // fase di posizionamento delle navi:
    if (this.positionedShips < 2) {
      // finché il giocatore ha navi da piazzare e le posiziona nella sua griglia:
      if (boardId === this.connection.binaryId && this.boards[this.connection.binaryId].player.shipsToPlace.length) {
        console.log('Questi sono i parametri passati a checkPositioning: ', boardId, ' ', row, ' ', col, ' ',
        this.boards[this.connection.binaryId].player.shipsToPlace[0].size, ' ', typeof(row));
        if (this.checkPositioning(boardId, row, col, this.boards[this.connection.binaryId].player.shipsToPlace[0].size,
          this.boards[this.connection.binaryId].player.shipsToPlace[0].id, this.orientation)) {
          const coordinates = {
            myBattle: this.myBattle,  // aggiunto questo campo per permettere di verificare a chi è indirizzato il segnale
            boardId: boardId,
            row: row,
            col: col,
            shipId: this.boards[this.connection.binaryId].player.shipsToPlace[0].id,
            size: this.boards[this.connection.binaryId].player.shipsToPlace[0].size,
            orientation: this.orientation
          };
          console.log(coordinates);
          this.connection.socket.emit('new ship', coordinates);
          const lastShip = this.boards[this.connection.binaryId].player.shipsToPlace.shift();
          this.boards[this.connection.binaryId].player.opponentShips.push(lastShip);
          this.sendBoardsListener(this.boards);
        } else {
          console.log('Posizionamento impossibile, seleziona un\'altra casella');
        }
        if (this.boards[this.connection.binaryId].player.shipsToPlace.length) {
          console.log('Ti rimangono da posizionare le seguenti navi:');
        }
        this.boards[this.connection.binaryId].player.shipsToPlace.forEach(function (item) {
          console.log(item.id);
        });
        if (!this.boards[this.connection.binaryId].player.shipsToPlace.length) {
          this.connection.socket.emit('navy positioned', this.myBattle);
        }
      } else if (!this.boards[this.connection.binaryId].player.shipsToPlace.length) {
        console.log('Attendi che anche l\'altro giocatore abbia posizionato le sue navi');
      } else {
        console.log('Devi posizionare le navi sulla tua griglia, che è l\'altra...');
      }
    } else {  // si comincia a sparare:
      if (this.currPlayer === this.connection.binaryId) {
        if (boardId !== this.currPlayer) {  // sto sparando nella griglia dell'avversario
          if (this.boards[boardId].tiles[row][col].value === 'X' || this.boards[boardId].tiles[row][col].value === 'M') {
            console.log('Hai già sparato su questa casella, spara di nuovo!');
          } else {
            if (this.boards[boardId].tiles[row][col].used === true) { // colpita una nave
              this.boards[boardId].tiles[row][col].value = 'X';
              ship['shipId'] = this.boards[boardId].tiles[row][col].shipId;
              const hitShip = this.boards[boardId].tiles[row][col].shipId;
              const hitShipIndex = this.boards[this.currPlayer].player.opponentShips.findIndex((item) => item.id === hitShip);
              this.connection.socket.emit('hit', {myBattle: this.myBattle, ship: ship});
              if (--this.boards[this.currPlayer].player.opponentShips[hitShipIndex].hits === 0) {
                console.log('Hai affondato la nave ' + hitShip);
              }
              this.boards[this.currPlayer].player.score++;
              console.log('Il punteggio attuale è: ' + this.boards[this.currPlayer].player.score);
              if (this.boards[this.currPlayer].player.score === this.hitsToWin) {
                console.log('Giocatore ' + this.currPlayer + ', hai vinto!');
                this.endGame = true;
                this.connection.socket.emit('endGame', this.myBattle);   // ANCORA DA IMPLEMENTARE!!!
                return;
              }
              this.connection.socket.emit('switch player', this.myBattle);
              this.currPlayer = (this.currPlayer + 1) % this.playersNumber;
              console.log('l\' attuale giocatore è: ' + this.currPlayer);
            } else if (this.boards[boardId].tiles[row][col].used === false) { // nessuna nave posizionata sulla cella
              this.boards[boardId].tiles[row][col].value = 'M';
              this.connection.socket.emit('miss', {myBattle: this.myBattle, ship: ship});
              this.connection.socket.emit('switch player', this.myBattle);
              this.currPlayer = (this.currPlayer + 1) % this.playersNumber;
              console.log('l\' attuale giocatore è: ' + this.currPlayer);
            }
          }
        } else {  // sto sparando nella mia griglia: errore
          console.log('Devi sparare nell\'altra griglia!');
        }
      } else {
        console.log('It\'s not your turn to play');     // il giocatore che ha selezionato la casella non ha rispettato il turno
      }
    }

  }

  checkPositioning(boardId: number, row: number, col: number, size: number, shipId: string, orientation: string) {
    if (size === 1) {
        console.log('a questo punto passo un row che vale: ', row);
        return this.boards[boardId].tiles[row][col].used === false && this.checkAround(boardId, row, col);
    } else if (orientation === 'horizontal') {
        return +col + size <= this.boardSize && this.boards[boardId].tiles[row][col].used === false
            && this.checkAround(boardId, row, col)
            && this.checkPositioning(boardId, row, +col + 1, size - 1, shipId, orientation);
    } else {
        return +row + size <= this.boardSize && this.boards[boardId].tiles[row][col].used === false
            && this.checkAround(boardId, row, col)
            && this.checkPositioning(boardId, +row + 1, col, size - 1, shipId, orientation);
    }
  }

  checkAround(boardId: number, row: number, col: number) {
    return ((row - 1 < 0 ||             // cella sopra
      (this.boards[boardId].tiles[row - 1][col] // !== undefined
      && this.boards[boardId].tiles[row - 1][col].used === false)) &&
      (row + 1 === this.boardSize ||   // cella sotto
      (this.boards[boardId].tiles[row + 1][col] // !== undefined
      && this.boards[boardId].tiles[row + 1][col].used === false)) &&
      (col + 1 === this.boardSize ||   // cella dx
      (this.boards[boardId].tiles[row][col + 1] // !== undefined
      && this.boards[boardId].tiles[row][col + 1].used === false)) &&
      (col - 1 < 0 ||                  // cella sx
      (this.boards[boardId].tiles[row][col - 1] // !== undefined
      && this.boards[boardId].tiles[row][col - 1].used === false)) &&
      ( // (row - 1 < 0 && col + 1 === this.boardSize) ||  // cella a NE
      row - 1 < 0 || col + 1 === this.boardSize ||
      (this.boards[boardId].tiles[row - 1][col + 1] // !== undefined
      && this.boards[boardId].tiles[row - 1][col + 1].used === false)) &&
      ( // (row + 1 === this.boardSize && col + 1 === this.boardSize) || // cella a SE
      row + 1 === this.boardSize || col + 1 === this.boardSize ||
      (this.boards[boardId].tiles[row + 1][col + 1] // !== undefined
      && this.boards[boardId].tiles[row + 1][col + 1].used === false))
      && ( // (row + 1 === this.boardSize && col - 1 < 0) || // cella a SO
      row + 1 === this.boardSize || col - 1 < 0 ||
      (this.boards[boardId].tiles[row + 1][col - 1] // !== undefined
      && this.boards[boardId].tiles[row + 1][col - 1].used === false))
      && ( // (row - 1 < 0 && col - 1 < 0) || // cella a NO
      row - 1 < 0 || col - 1 < 0 ||
      (this.boards[boardId].tiles[row - 1][col - 1] // !== undefined
      && this.boards[boardId].tiles[row - 1][col - 1].used === false)));
  }

  addShip(boardId: number, row: number, col: number, shipId: number, size: number, orientation: string) {
    if (size === 1) {
      this.boards[boardId].tiles[row][col].used = true;
      this.boards[boardId].tiles[row][col].shipId = shipId;
      // this.sendBoardsListener(this.boards);  // perché non serve questo comando?
    } else if (orientation === 'horizontal') {
      this.boards[boardId].tiles[row][col].used = true;
      this.boards[boardId].tiles[row][col].shipId = shipId;
      this.addShip(boardId, row, +col + 1, shipId, size - 1, orientation);
    } else {
      this.boards[boardId].tiles[row][col].used = true;
      this.boards[boardId].tiles[row][col].shipId = shipId;
      this.addShip(boardId, +row + 1, col, shipId, size - 1, orientation);
    }
  }

  setHorizontal() {
    this.orientation = 'horizontal';
    this.sendOrientationListener(this.orientation);
  }

  setVertical() {
    this.orientation = 'vertical';
    this.sendOrientationListener(this.orientation);
  }

  // checkNE(boardId: number, row: number, col: number, shipId: string) {
  //   console.log('questo è row: ', row);
  //   console.log('row + 1 = ', row, ' ', row + 1 );
  //   console.log('col + 1 = ', col + 1 );
  //   console.log('typeof this.boardsize = ' + typeof(this.boardSize));
  //   console.log('+row + 1 === this.boardSize && +col + 1 === this.boardSize = ',
  //     (+row + 1 === this.boardSize && +col + 1 === this.boardSize));
  //   return ((+row - 1 < 0 && +col + 1 === this.boardSize)  // cella a NE
  //   || +row - 1 < 0 || +col + 1 === this.boardSize
  //   || (this.boards[boardId].tiles[row - 1][col + 1] // !== undefined
  //   && this.boards[boardId].tiles[row - 1][col + 1].used === false) ||
  //   (this.boards[boardId].tiles[row - 1][col + 1] // !== undefined
  //   && this.boards[boardId].tiles[row - 1][col + 1].shipId === shipId)
  //   );
  // }

  // checkAround2(boardId: number, row: number, col: number, shipId: string) {
  //   if (!+row) {  // prima riga
  //     if (+col === this.boardSize - 1) {  // ultima colonna
  //       return this.boards[boardId].tiles[+row - 1][col].used === (false || shipId) &&  // controllo riga sotto
  //         this.boards[boardId].tiles[row][+col - 1].used === (false || shipId); // controllo colonna precedente
  //     } else if (!+col) { // prima colonna
  //       return this.boards[boardId].tiles[+row - 1][col].used === (false || shipId) &&
  //       // this.boards[boardId].tiles[row][+col - 1].used === (false || shipId) &&
  //       this.boards[boardId].tiles[row][+col + 1].used === (false || shipId); // controllo colonna successiva
  //     } else {  // colonna intermedia
  //       return this.boards[boardId].tiles[+row - 1][col].used === (false || shipId) &&
  //       this.boards[boardId].tiles[row][+col - 1].used === (false || shipId) &&
  //       this.boards[boardId].tiles[row][+col + 1].used === (false || shipId);
  //     }
  //   } else if (+row === this.boardSize - 1) { // ultima riga
  //     if (+col === this.boardSize - 1) {  // ultima colonna
  //       return this.boards[boardId].tiles[+row + 1][col].used === (false || shipId) &&  // controllo riga sopra
  //         this.boards[boardId].tiles[row][+col - 1].used === (false || shipId); // controllo colonna precedente
  //     } else if (!+col) { // prima colonna
  //       return this.boards[boardId].tiles[+row + 1][col].used === (false || shipId) &&  // controllo riga sopra
  //       true; // da completare
  //     }
  //   }
  // }

  // checkAround(boardId: number, row: number, col: number, shipId: string) {
  //   return (+row - 1 < 0 ||             // cella sopra
  //     (this.boards[boardId].tiles[+row - 1][col] && this.boards[boardId].tiles[+row - 1][col].used === false) ||
  //     (this.boards[boardId].tiles[+row - 1][col] && this.boards[boardId].tiles[+row - 1][col].shipId === shipId)) &&
  //     (+row + 1 === this.boardSize ||   // cella sotto
  //     (this.boards[boardId].tiles[+row + 1][col] && this.boards[boardId].tiles[+row + 1][col].used === false) ||
  //     (this.boards[boardId].tiles[+row + 1][col] && this.boards[boardId].tiles[+row + 1][col].shipId === shipId)) &&
  //     (+col + 1 === this.boardSize ||   // cella dx
  //     (this.boards[boardId].tiles[row][+col + 1] && this.boards[boardId].tiles[row][+col + 1].used === false) ||
  //     (this.boards[boardId].tiles[row][+col + 1] && this.boards[boardId].tiles[row][+col + 1].shipId === shipId)) &&
  //     (+col - 1 < 0 ||                  // cella sx
  //     (this.boards[boardId].tiles[row][+col - 1] && this.boards[boardId].tiles[row][+col - 1].used === false) ||
  //     (this.boards[boardId].tiles[row][+col - 1] && this.boards[boardId].tiles[row][+col - 1].shipId === shipId)) &&
  //     ((+row - 1 < 0 && +col + 1 === this.boardSize) ||  // cella a NE
  //     (this.boards[boardId].tiles[+row - 1][+col + 1] && this.boards[boardId].tiles[+row - 1][+col + 1].used === false) ||
  //     (this.boards[boardId].tiles[+row - 1][+col + 1] && this.boards[boardId].tiles[+row - 1][+col + 1].shipId === shipId)) &&
  //     ((+row + 1 === this.boardSize && +col + 1 === this.boardSize) || // cella a SE
  //     (this.boards[boardId].tiles[+row + 1][+col + 1] && this.boards[boardId].tiles[+row + 1][+col + 1].used === false) ||
  //     (this.boards[boardId].tiles[+row + 1][+col + 1] && this.boards[boardId].tiles[+row + 1][+col + 1].shipId === shipId)) &&
  //     ((+row + 1 === this.boardSize && +col - 1 < 0) || // cella a SO
  //     (this.boards[boardId].tiles[+row + 1][+col - 1] && this.boards[boardId].tiles[+row + 1][+col - 1].used === false) ||
  //     (this.boards[boardId].tiles[+row + 1][+col - 1] && this.boards[boardId].tiles[+row + 1][+col - 1].shipId === shipId)) &&
  //     ((+row - 1 < 0 && +col - 1 < 0) || // cella a NO
  //     (this.boards[boardId].tiles[+row - 1][+col - 1] && this.boards[boardId].tiles[+row - 1][+col - 1].used === false) ||
  //     (this.boards[boardId].tiles[+row - 1][+col - 1] && this.boards[boardId].tiles[+row - 1][+col - 1].shipId === shipId));
  // }

  // checkAround3(boardId: number, row: number, col: number, shipId: string) {
  //   return ((row - 1 < 0 ||             // cella sopra
  //     (this.boards[boardId].tiles[row - 1][col] // !== undefined
  //     && this.boards[boardId].tiles[row - 1][col].used === false) ||
  //     (this.boards[boardId].tiles[row - 1][col] // !== undefined
  //     && this.boards[boardId].tiles[row - 1][col].shipId === shipId)) &&
  //     (row + 1 === this.boardSize ||   // cella sotto
  //     (this.boards[boardId].tiles[row + 1][col] // !== undefined
  //     && this.boards[boardId].tiles[row + 1][col].used === false) ||
  //     (this.boards[boardId].tiles[row + 1][col] // !== undefined
  //     && this.boards[boardId].tiles[row + 1][col].shipId === shipId)) &&
  //     (col + 1 === this.boardSize ||   // cella dx
  //     (this.boards[boardId].tiles[row][col + 1] // !== undefined
  //     && this.boards[boardId].tiles[row][col + 1].used === false) ||
  //     (this.boards[boardId].tiles[row][col + 1] // !== undefined
  //     && this.boards[boardId].tiles[row][col + 1].shipId === shipId)) &&
  //     (col - 1 < 0 ||                  // cella sx
  //     (this.boards[boardId].tiles[row][col - 1] // !== undefined
  //     && this.boards[boardId].tiles[row][col - 1].used === false) ||
  //     (this.boards[boardId].tiles[row][col - 1] // !== undefined
  //     && this.boards[boardId].tiles[row][col - 1].shipId === shipId)) &&
  //     ((row - 1 < 0 && col + 1 === this.boardSize) ||  // cella a NE
  //     row - 1 < 0 || col + 1 === this.boardSize ||
  //     (this.boards[boardId].tiles[row - 1][col + 1] // !== undefined
  //     && this.boards[boardId].tiles[row - 1][col + 1].used === false) ||
  //     (this.boards[boardId].tiles[row - 1][col + 1] // !== undefined
  //     && this.boards[boardId].tiles[row - 1][col + 1].shipId === shipId)) &&
  //     ((row + 1 === this.boardSize && col + 1 === this.boardSize) || // cella a SE
  //     row + 1 === this.boardSize || col + 1 === this.boardSize ||
  //     (this.boards[boardId].tiles[row + 1][col + 1] // !== undefined
  //     && this.boards[boardId].tiles[row + 1][col + 1].used === false) ||
  //     (this.boards[boardId].tiles[row + 1][col + 1] // !== undefined
  //     && this.boards[boardId].tiles[row + 1][col + 1].shipId === shipId))
  //     && ((row + 1 === this.boardSize && col - 1 < 0) || // cella a SO
  //     row + 1 === this.boardSize || col - 1 < 0 ||
  //     (this.boards[boardId].tiles[row + 1][col - 1] // !== undefined
  //     && this.boards[boardId].tiles[row + 1][col - 1].used === false) ||
  //     (this.boards[boardId].tiles[row + 1][col - 1] // !== undefined
  //     && this.boards[boardId].tiles[row + 1][col - 1].shipId === shipId))
  //     && ((row - 1 < 0 && col - 1 < 0) || // cella a NO
  //     row - 1 < 0 || col - 1 < 0 ||
  //     (this.boards[boardId].tiles[row - 1][col - 1] // !== undefined
  //     && this.boards[boardId].tiles[row - 1][col - 1].used === false) ||
  //     (this.boards[boardId].tiles[row - 1][col - 1] // !== undefined
  //     && this.boards[boardId].tiles[row - 1][col - 1].shipId === shipId)));
  // }


}
