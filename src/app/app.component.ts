import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
    selector: 'app-root',
    imports: [],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: true
})
export class AppComponent implements OnInit {
  title = 'wordleydurdley';
  grid;
  hitStatuses = ['correct', 'present'];
  private http = inject(HttpClient);
  private _correctAnswer: string = '';
  guesses: string[] = [];
  invalidGuess = false;

  constructor() {
    this.grid = Array.from({ length: 6 }, () => Array(5).fill({ letter: '', status: '', index: 0 }));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 5; j++) {
        this.grid[i][j] = { letter: '', status: '', index: j };
      }
    }
  }

  ngOnInit(): void {
    this.http.get<string[]>('https://random-word-api.herokuapp.com/word', { params: { length: '5' } })
      .subscribe((data: string[]) => {
        this._correctAnswer = data[0].toUpperCase();
      });
  }

  get correctAnswer(): string {
    return this._correctAnswer;
  }

  get guessWasCorrect(): boolean {
    return this.guesses.length > 0 && this.guesses[this.guesses.length - 1] === this.correctAnswer;
  }

  get canReset(): boolean {
    return this.guessWasCorrect || this.guesses.length >= 6;
  }

  guessIsAWord(guess: string): Observable<boolean> {
    return this.http.get('https://api.dictionaryapi.dev/api/v2/entries/en/' + guess.toLowerCase())
      .pipe(
        map(data => Array.isArray(data)), // true if array, false if object
        catchError(() => of(false)) // If the API returns an error, treat as not a word;
      );
  }

  submitGuess(guess: string) {
    this.invalidGuess = false;
    if (guess.length !== 5) {
      this.invalidGuess = true;
      return;
    }
    this.guessIsAWord(guess).subscribe(isWord => {
      if (isWord || guess == this.correctAnswer) { // Allow the guess if it's a valid word or matches the correct answer
        const currentRow = this.grid.find(row => row[0].letter == '');
        guess = guess.toUpperCase();
        if (currentRow) {
          for (let i = 0; i < 5; i++) { // in order to properly count yellow tiles, we need to first mark correct letters
            if (guess[i] === this.correctAnswer[i]) {
              currentRow[i].status = 'correct';
            }
            currentRow[i].letter = guess[i];
          }
          for (let i = 0; i < 5; i++) {
            if (currentRow[i].status === 'correct') continue;
            if (this.correctAnswer.includes(guess[i]) && this.correctAnswer.split(guess[i]).length - 1 > currentRow.filter(tile => this.hitStatuses.includes(tile.status) && tile.letter == guess[i]).length) {
              currentRow[i].status = 'present';
            } else {
              currentRow[i].status = 'absent';
            }
          }
          this.guesses.push(guess);
        }
      } else {
        this.invalidGuess = true;
      }
    });
  }

  resetGame() {
    this.grid = Array.from({ length: 6 }, () => Array(5).fill({ letter: '', status: '', index: 0 }));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 5; j++) {
        this.grid[i][j] = { letter: '', status: '', index: j };
      }
    }
    this.guesses = [];
    this._correctAnswer = '';
    this.invalidGuess = false;
    this.ngOnInit();
  }
}
