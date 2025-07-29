import { TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have the correct title', () => {
      expect(component.title).toEqual('wordleydurdley');
    });

    it('should initialize grid with 6 rows and 5 columns', () => {
      expect(component.grid.length).toBe(6);
      component.grid.forEach(row => {
        expect(row.length).toBe(5);
        row.forEach((tile, index) => {
          expect(tile.letter).toBe('');
          expect(tile.status).toBe('');
          expect(tile.index).toBe(index);
        });
      });
    });

    it('should initialize guesses as empty array', () => {
      expect(component.guesses).toEqual([]);
    });

    it('should initialize invalidGuess as false', () => {
      expect(component.invalidGuess).toBe(false);
    });

    it('should initialize showMessage as false', () => {
      expect(component.showMessage).toBe(false);
    });

    it('should initialize hitStatuses with correct values', () => {
      expect(component.hitStatuses).toEqual(['correct', 'present']);
    });
  });

  describe('ngOnInit', () => {
    it('should fetch a random word and set correctAnswer', fakeAsync(() => {
      const mockWord = 'APPLE';
      spyOn(component, 'setMessage');

      component.ngOnInit();

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      expect(req.request.method).toBe('GET');
      req.flush([mockWord.toLowerCase()]);

      tick();

      expect(component.correctAnswer).toBe(mockWord);
      expect(component.setMessage).toHaveBeenCalled();
    }));

    it('should call setMessage on initialization', () => {
      spyOn(component, 'setMessage');
      component.ngOnInit();

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['test']);

      expect(component.setMessage).toHaveBeenCalled();
    });
  });

  describe('Getter Methods', () => {
    describe('correctAnswer', () => {
      it('should return the private _correctAnswer value', () => {
        component['_correctAnswer'] = 'TESTS';
        expect(component.correctAnswer).toBe('TESTS');
      });
    });

    describe('guessWasCorrect', () => {
      it('should return false when no guesses have been made', () => {
        component.guesses = [];
        expect(component.guessWasCorrect).toBe(false);
      });

      it('should return true when last guess matches correctAnswer', () => {
        component['_correctAnswer'] = 'TESTS';
        component.guesses = ['WRONG', 'TESTS'];
        expect(component.guessWasCorrect).toBe(true);
      });

      it('should return false when last guess does not match correctAnswer', () => {
        component['_correctAnswer'] = 'TESTS';
        component.guesses = ['WRONG', 'OTHER'];
        expect(component.guessWasCorrect).toBe(false);
      });
    });

    describe('canReset', () => {
      it('should return true when guess was correct', () => {
        component['_correctAnswer'] = 'TESTS';
        component.guesses = ['TESTS'];
        expect(component.canReset).toBe(true);
      });

      it('should return true when 6 guesses have been made', () => {
        component.guesses = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
        expect(component.canReset).toBe(true);
      });

      it('should return false when less than 6 guesses and none correct', () => {
        component['_correctAnswer'] = 'TESTS';
        component.guesses = ['WRONG', 'OTHER'];
        expect(component.canReset).toBe(false);
      });
    });
  });

  describe('displayMessage', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should set message text and show message', () => {
      const testMessage = 'Test message';
      component.displayMessage(testMessage);

      expect(component.messageText).toBe(testMessage);
      expect(component.showMessage).toBe(true);
    });

    it('should set random angle between -40 and 40', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      component.displayMessage('Test');

      expect(component.messageAngle).toBeGreaterThanOrEqual(-40);
      expect(component.messageAngle).toBeLessThanOrEqual(40);
    });

    it('should hide message after default timeout (2200ms)', () => {
      component.displayMessage('Test');
      expect(component.showMessage).toBe(true);

      jasmine.clock().tick(2200);
      expect(component.showMessage).toBe(false);
    });

    it('should hide message after custom timeout', () => {
      component.displayMessage('Test', 5000);
      expect(component.showMessage).toBe(true);

      jasmine.clock().tick(2199);
      expect(component.showMessage).toBe(true);

      jasmine.clock().tick(1);
      expect(component.showMessage).toBe(false);
    });
  });

  describe('setMessage', () => {
    let displayMessageSpy: jasmine.Spy;

    beforeEach(() => {
      displayMessageSpy = spyOn(component, 'displayMessage');
    });

    it('should display congratulations message when guess was correct', () => {
      component['_correctAnswer'] = 'TESTS';
      component.guesses = ['TESTS'];

      component.setMessage();

      expect(displayMessageSpy).toHaveBeenCalledWith(
        'Congratulations! You guessed the word!',
        5000
      );
    });

    it('should display invalid guess message when invalidGuess is true', () => {
      component.invalidGuess = true;
      component.guesses = ['WRONG'];

      component.setMessage();

      expect(displayMessageSpy).toHaveBeenCalledWith(
        'Please enter a valid 5-letter word.'
      );
    });

    it('should display initial message when no guesses made', () => {
      component.guesses = [];
      component.invalidGuess = false;

      component.setMessage();

      expect(displayMessageSpy).toHaveBeenCalledWith(
        'Guess a 5-letter word!'
      );
    });

    it('should display keep guessing message when guesses < 6 and not correct', () => {
      component['_correctAnswer'] = 'TESTS';
      component.guesses = ['WRONG', 'OTHER'];
      component.invalidGuess = false;

      component.setMessage();

      expect(displayMessageSpy).toHaveBeenCalledWith(
        'Keep guessing!'
      );
    });

    it('should display game over message with answer when 6 guesses made', () => {
      component['_correctAnswer'] = 'TESTS';
      component.guesses = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
      component.invalidGuess = false;

      component.setMessage();

      expect(displayMessageSpy).toHaveBeenCalledWith(
        'Game over! The correct answer was: TESTS',
        5000
      );
    });
  });

  describe('submitGuess', () => {
    let guessIsAWordSpy: jasmine.Spy;
    let setMessageSpy: jasmine.Spy;

    beforeEach(() => {
      guessIsAWordSpy = spyOn(component, 'guessIsAWord');
      setMessageSpy = spyOn(component, 'setMessage');
      component['_correctAnswer'] = 'TESTS';
    });

    it('should set invalidGuess to true and return early if guess length is not 5', () => {
      component.submitGuess('ABC');

      expect(component.invalidGuess).toBe(true);
      expect(setMessageSpy).toHaveBeenCalled();
      expect(guessIsAWordSpy).not.toHaveBeenCalled();
    });

    it('should check if guess is a valid word', () => {
      guessIsAWordSpy.and.returnValue(of(true));

      component.submitGuess('APPLE');

      expect(guessIsAWordSpy).toHaveBeenCalledWith('APPLE');
    });

    it('should accept guess if it matches correctAnswer even if not a valid word', () => {
      guessIsAWordSpy.and.returnValue(of(false));

      component.submitGuess('tests');

      expect(component.guesses).toContain('TESTS');
    });

    it('should mark letters as correct when they match position', () => {
      guessIsAWordSpy.and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('TESTS');

      const firstRow = component.grid[0];
      firstRow.forEach((tile, index) => {
        expect(tile.letter).toBe('TESTS'[index]);
        expect(tile.status).toBe('correct');
      });
    });

    it('should mark letters as present when in word but wrong position', () => {
      guessIsAWordSpy.and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('STETS');

      const firstRow = component.grid[0];
      expect(firstRow[0].status).toBe('present'); // S is in word
      expect(firstRow[1].status).toBe('present'); // T is in word
      expect(firstRow[2].status).toBe('absent');  // E is not in this position
      expect(firstRow[3].status).toBe('correct'); // T is correct
      expect(firstRow[4].status).toBe('correct'); // S is correct
    });

    it('should mark letters as absent when not in word', () => {
      guessIsAWordSpy.and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('ABCDE');

      const firstRow = component.grid[0];
      firstRow.forEach(tile => {
        expect(tile.status).toBe('absent');
      });
    });

    it('should handle duplicate letters correctly', () => {
      guessIsAWordSpy.and.returnValue(of(true));
      component['_correctAnswer'] = 'ROBOT';

      component.submitGuess('FLOOR');

      const firstRow = component.grid[0];
      expect(firstRow[0].status).toBe('absent');  // F not in word
      expect(firstRow[1].status).toBe('absent');  // L not in word
      expect(firstRow[2].status).toBe('present'); // First O is present
      expect(firstRow[3].status).toBe('correct'); // Second O is correct
      expect(firstRow[4].status).toBe('absent');  // R is not in this position but already counted
    });

    it('should set invalidGuess to true if word is not valid and not correctAnswer', () => {
      guessIsAWordSpy.and.returnValue(of(false));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('ZZZZZ');

      expect(component.invalidGuess).toBe(true);
      expect(component.guesses).not.toContain('ZZZZZ');
    });

    it('should add guess to guesses array', () => {
      guessIsAWordSpy.and.returnValue(of(true));

      component.submitGuess('APPLE');

      expect(component.guesses).toContain('APPLE');
    });

    it('should convert guess to uppercase', () => {
      guessIsAWordSpy.and.returnValue(of(true));

      component.submitGuess('apple');

      expect(component.guesses).toContain('APPLE');
    });

    it('should fill the next available row in grid', () => {
      guessIsAWordSpy.and.returnValue(of(true));

      // First guess
      component.submitGuess('APPLE');
      expect(component.grid[0][0].letter).toBe('A');

      // Second guess
      component.submitGuess('TESTS');
      expect(component.grid[1][0].letter).toBe('T');
    });
  });

  describe('guessIsAWord', () => {
    it('should return true when API returns array (valid word)', (done) => {
      const testWord = 'apple';

      component.guessIsAWord(testWord).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/${testWord}`);
      expect(req.request.method).toBe('GET');
      req.flush([{ word: testWord }]); // API returns array for valid words
    });

    it('should return false when API returns error', (done) => {
      const testWord = 'zzzzz';

      component.guessIsAWord(testWord).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/${testWord}`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should convert word to lowercase before API call', () => {
      const testWord = 'APPLE';

      component.guessIsAWord(testWord).subscribe();

      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/apple`);
      expect(req.request.url).toContain('apple');
      req.flush([]);
    });

    it('should return false when API returns non-array', (done) => {
      const testWord = 'test';

      component.guessIsAWord(testWord).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/${testWord}`);
      req.flush({ error: 'Not found' }); // Object instead of array
    });
  });

  describe('resetGame', () => {
    beforeEach(() => {
      // Setup some game state
      component.guesses = ['APPLE', 'TESTS'];
      component['_correctAnswer'] = 'WORDS';
      component.invalidGuess = true;

      // Modify grid
      component.grid[0][0].letter = 'A';
      component.grid[0][0].status = 'correct';
    });

    it('should reset grid to initial state', () => {
      component.resetGame();

      // Handle the HTTP request from ngOnInit
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['newword']);

      expect(component.grid.length).toBe(6);
      component.grid.forEach(row => {
        expect(row.length).toBe(5);
        row.forEach((tile, index) => {
          expect(tile.letter).toBe('');
          expect(tile.status).toBe('');
          expect(tile.index).toBe(index);
        });
      });
    });

    it('should clear guesses array', () => {
      component.resetGame();

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['newword']);

      expect(component.guesses).toEqual([]);
    });

    it('should reset correctAnswer', () => {
      component.resetGame();

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['newword']);

      expect(component.correctAnswer).toBe('NEWWORD');
    });

    it('should reset invalidGuess to false', () => {
      component.resetGame();

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['newword']);

      expect(component.invalidGuess).toBe(false);
    });

    it('should call ngOnInit to fetch new word', () => {
      spyOn(component, 'ngOnInit');

      component.resetGame();

      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should complete a full game with correct guess', () => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      // Make some wrong guesses
      component.submitGuess('APPLE');
      expect(component.guesses.length).toBe(1);
      expect(component.canReset).toBe(false);

      component.submitGuess('WORDS');
      expect(component.guesses.length).toBe(2);
      expect(component.canReset).toBe(false);

      // Make correct guess
      component.submitGuess('TESTS');
      expect(component.guesses.length).toBe(3);
      expect(component.guessWasCorrect).toBe(true);
      expect(component.canReset).toBe(true);
    });

    it('should complete a full game with 6 wrong guesses', () => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      const wrongGuesses = ['APPLE', 'WORDS', 'BEACH', 'CHAIR', 'DESK', 'FLOOR'];

      wrongGuesses.forEach((guess, index) => {
        component.submitGuess(guess);
        expect(component.guesses.length).toBe(index + 1);
      });

      expect(component.guessWasCorrect).toBe(false);
      expect(component.canReset).toBe(true);
    });

    it('should handle mix of valid and invalid guesses', () => {
      const guessIsAWordSpy = spyOn(component, 'guessIsAWord');
      component['_correctAnswer'] = 'TESTS';

      // Invalid length
      component.submitGuess('ABC');
      expect(component.invalidGuess).toBe(true);
      expect(component.guesses.length).toBe(0);

      // Invalid word
      guessIsAWordSpy.and.returnValue(of(false));
      component.submitGuess('ZZZZZ');
      expect(component.invalidGuess).toBe(true);
      expect(component.guesses.length).toBe(0);

      // Valid word
      guessIsAWordSpy.and.returnValue(of(true));
      component.submitGuess('APPLE');
      expect(component.invalidGuess).toBe(false);
      expect(component.guesses.length).toBe(1);
    });
  });
});
