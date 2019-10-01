import {
  Component, Input, ElementRef, AfterViewInit, ViewChild, OnInit, HostListener
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

export interface BoardCell {
  value: number;
  imgSource: string;
  weight: number;
}

export interface Board {
  value: BoardCell[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('canvasVertical') public canvasVertical: ElementRef;
  @ViewChild('canvasHorizontal') public canvasHorizontal: ElementRef;

  title = 'Darts';
  boardData: Board[] = this.getBoardValues();

  xRunning = false;
  yRunning = false;
  reverseX = false;
  reverseY = false;

  lineLengthX = 1;
  lineLengthY = 1;
  @Input() public widthY = 50;
  @Input() public heightY = 600;
  @Input() public widthX = 600;
  @Input() public heightX = 50;
  speedX = 0;
  speedY = 0;
  posY = 0;
  posX = 0;

  totalScore = 0;
  totalChances: any[] = [1, 1, 1, 1, 1, 1];
  scores: any[] = new Array();
  gameOver = false;
  @HostListener('window:keydown.space') spaceEvent() {
    this.hit();
  }

  private cx: CanvasRenderingContext2D;
  private cx2: CanvasRenderingContext2D;
  ngOnInit(): void {
    this.startXAxis();
  }
  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvasVertical.nativeElement;
    this.cx = canvasEl.getContext('2d');
    canvasEl.width = this.widthY;
    canvasEl.height = this.heightY;
    this.cx.lineWidth = 10;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    const canvasE2: HTMLCanvasElement = this.canvasHorizontal.nativeElement;
    this.cx2 = canvasE2.getContext('2d');
    canvasE2.width = this.widthX;
    canvasE2.height = this.heightX;
    this.cx2.lineWidth = 10;
    this.cx2.lineCap = 'round';
    this.cx2.strokeStyle = '#000';

    window.requestAnimationFrame(() => this.loopY(canvasEl));
    window.requestAnimationFrame(() => this.loopX(canvasE2));
  }

  drawLineY(canvasEl: HTMLCanvasElement) {
    this.cx.beginPath();
    this.cx.moveTo(10, this.posY);
    this.cx.lineTo(10, this.posY + this.lineLengthY);
    this.cx.stroke();
  }

  moveLineY(canvasEl: HTMLCanvasElement) {
    this.posY += this.speedY;
    if (this.posY < 0 || this.posY > canvasEl.height) {
      this.speedY = this.speedY * -1;
    }
  }


  drawLineX(canvasE2: HTMLCanvasElement) {
    this.cx2.beginPath();
    this.cx2.moveTo(this.posX, 10);
    this.cx2.lineTo(this.posX + this.lineLengthX, 10);
    this.cx2.stroke();
  }

  moveLineX(canvasE2: HTMLCanvasElement) {
    this.posX += this.speedX
    if (this.posX < 0 || this.posX > canvasE2.width) {
      this.speedX = this.speedX * -1;
    }
  }

  loopX(canvasE2: HTMLCanvasElement) {
    // clear old frame;        
    this.cx2.clearRect(0, 0, this.widthX, this.widthX);
    this.moveLineX(canvasE2);
    this.drawLineX(canvasE2);
    window.requestAnimationFrame(() => this.loopX(canvasE2));
  }


  loopY(canvasEl: HTMLCanvasElement) {
    // clear old frame;        
    this.cx.clearRect(0, 0, this.heightY, this.heightY);
    this.moveLineY(canvasEl);
    this.drawLineY(canvasEl);
    window.requestAnimationFrame(() => this.loopY(canvasEl));
  }


  hit() {
    if (this.xRunning) {
      this.stopXAxis();
      this.startYAxis()
    }
    else if (this.yRunning) {
      this.stopYAxis();
      this.launch();
      this.totalChances.pop();
      this.reset();
      if (this.totalChances.length > 0) {
        this.startXAxis();
      }
      else {
        this.gameOver = true;
      }
    }
  }

  reset() {
    this.posX = 0;
    this.posY = 0;
  }
  restart() {
    this.reset();
    this.totalScore = 0;
    this.totalChances = [1, 1, 1, 1, 1, 1];
    this.scores = new Array();
    this.gameOver = false;

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.boardData[i].value[j].imgSource = '';
      }
    }


    this.startXAxis();
  }

  launch() {
    this.playAudio();

    if (this.posX < 0) {
      this.posX = 1;
    }

    if (this.posY < 0) {
      this.posY = 1;
    }

    if (this.posX > 600) {
      this.posX = 600;
    }

    if (this.posY > 600) {
      this.posY = 600;
    }

    let percentX = (this.posX / 600) * 100;
    let percentY = (this.posY / 600) * 100;

    let yIndex = Math.floor(percentY / 10);
    let xIndex = Math.floor(percentX / 10);
    if (yIndex >= 10) {
      yIndex = 9;
    }

    if (xIndex >= 10) {
      xIndex = 9;
    }
    console.log(yIndex)
    console.log(xIndex)
    console.log(this.boardData[9].value[0])
    try {
      this.boardData[yIndex].value[xIndex].imgSource = '../assets/aimed.png';
      var score = this.boardData[yIndex].value[xIndex].weight;
      this.scores.push(score);
      this.totalScore = this.totalScore + score;
    } catch (error) {

      this.boardData[0].value[0].imgSource = '../assets/aimed.png';
      var score = this.boardData[0].value[0].weight;
      this.scores.push(score);
      this.totalScore = this.totalScore + score;
    }

  }

  playAudio() {
    let audio = new Audio();
    audio.src = "../assets/hit.wav";
    audio.load();
    audio.play();
  }

  startXAxis() {
    this.xRunning = true;
    this.speedX = 10;
  }

  startYAxis() {
    this.speedY = 10;
    this.yRunning = true;
  }

  stopXAxis() {
    this.xRunning = false;
    this.speedX = 0;
  }

  stopYAxis() {
    this.yRunning = false;
    this.speedY = 0;
  }


  getBoardValues() {
    let board: Board[] = new Array();
    var num: number = 0
    var cell: number = 0;

    for (num = 0; num < 10; num++) {
      let boardrow: BoardCell[] = new Array();
      for (cell = 0; cell < 10; cell++) {
        let data = {} as BoardCell;
        data.imgSource = '';
        data.value = cell;

        if ((num == 4 && cell == 4) ||
          (num == 4 && cell == 5) ||
          (num == 5 && cell == 4) ||
          (num == 5 && cell == 5)) {
          data.weight = 25;
        }
        else if ((num == 3 && (cell > 3 && cell < 6)) ||
          (num == 4 && (cell > 2 && cell < 7) ||
            (num == 5 && (cell > 2 && cell < 7)) ||
            (num == 6 && (cell > 3 && cell < 6)))) {
          data.weight = 20;
        }
        else if ((num == 2 && (cell > 3 && cell < 6)) ||
          (num == 3 && (cell > 2 && cell < 7)) ||
          (num == 4 && (cell > 1 && cell < 8)) ||
          (num == 5 && (cell > 1 && cell < 8)) ||
          (num == 6 && (cell > 2 && cell < 7)) ||
          (num == 7 && (cell > 3 && cell < 6))
        ) {
          data.weight = 15;
        }
        else if ((num == 1 && (cell > 3 && cell < 6)) ||
          (num == 2 && (cell > 2 && cell < 7)) ||
          (num == 3 && (cell > 1 && cell < 8)) ||
          (num == 4 && (cell > 1 && cell < 9)) ||
          (num == 5 && (cell > 1 && cell < 9)) ||
          (num == 6 && (cell > 1 && cell < 8)) ||
          (num == 7 && (cell > 2 && cell < 7)) ||
          (num == 8 && (cell > 3 && cell < 6))
        ) {
          data.weight = 10;
        }
        else if (num == 0 || cell == 0 || cell == 9 || num == 9) {
          data.weight = 0;
        }
        else {
          data.weight = 5;
        }

        boardrow.push(data);
      }
      let row = {} as Board;
      row.value = boardrow;
      board.push(row);
    }
    return board;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
