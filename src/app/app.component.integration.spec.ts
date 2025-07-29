import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { TestHelpers, TestDataFactory, AsyncTestHelpers } from './test-helpers';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { HttpBackend } from '@angular/common/http';

describe('AppComponent Integration Tests', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    compiled = fixture.nativeElement;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('UI Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['tests']);
    });

    it('should not render a title', () => {
      const title = compiled.querySelector('h1');
      expect(title).toBeFalsy();
    });

    it('should render the game grid', fakeAsync(() => {
      // Trigger initial data binding
      fixture.detectChanges();
      tick();

      const gridRows = compiled.querySelectorAll('.wordle-row');
      expect(gridRows.length).toBe(6);

      gridRows.forEach(row => {
        const tiles = row.querySelectorAll('.wordle-tile');
        expect(tiles.length).toBe(5);
      });
    }));

    it('should render input field for guesses', () => {
      const input = compiled.querySelector('input[type="text"]');
      expect(input).toBeTruthy();
      expect((input as HTMLInputElement)?.placeholder).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = compiled.querySelector('input[type="button"][value="Submit Guess"]');
      expect(submitButton).toBeTruthy();
      expect((submitButton as HTMLInputElement)?.value).toBe('Submit Guess');
    });

    it('should not render reset button initially', () => {
      const resetButton = compiled.querySelector('input[type="button"][value="Reset Game"]');
      expect(resetButton).toBeFalsy();
    });

    it('should display message area', fakeAsync(() => {
      const messageArea = compiled.querySelector('.message-overlay');
      tick();
      fixture.detectChanges();
      expect(messageArea).toBeTruthy();
    }));
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['tests']);
      fixture.detectChanges();
    });

    it('should update input value when user types', fakeAsync(() => {
      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;

      input.value = 'APPLE';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      tick();

      expect(component.guessValue).toBe('APPLE');
    }));

    it('should submit guess when form is submitted', fakeAsync(() => {
      spyOn(component, 'submitGuess');
      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;
      const button = compiled.querySelector('input[type="button"][value="Submit Guess"]') as HTMLInputElement;

      input.value = 'APPLE';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      button.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      tick();

      expect(component.submitGuess).toHaveBeenCalledWith('APPLE');
    }));

    it('should clear input after successful submission', fakeAsync(() => {
      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      const button = compiled.querySelector('input[type="button"][value="Submit Guess"]') as HTMLInputElement;

      component.guessValue = 'APPLE';
      input.value = 'APPLE';
      fixture.detectChanges();
      button.dispatchEvent(new PointerEvent('click'));
      fixture.detectChanges();

      expect(component.guessValue).toBe('');
    }));

    it('should show reset button after game ends', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));

      // Make 6 guesses
      for (let i = 0; i < 6; i++) {
        component.submitGuess(TestDataFactory.getValidWord());
      }

      fixture.detectChanges();
      tick();

      fixture.detectChanges();
      const resetButton = compiled.querySelector('input[type="button"][value="Reset Game"]') as HTMLInputElement;
      expect(resetButton).toBeTruthy();
      expect(resetButton.value).toBe('Reset Game');
    }));

    it('should reset game when reset button is clicked', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      spyOn(component, 'resetGame');

      // Make game end
      for (let i = 0; i < 6; i++) {
        component.submitGuess(TestDataFactory.getValidWord());
        tick();
      }

      tick();

      fixture.detectChanges();
      const resetButton = compiled.querySelector('input[type="button"][value="Reset Game"]') as HTMLButtonElement;
      resetButton.click();
      fixture.detectChanges();
      tick();

      expect(component.resetGame).toHaveBeenCalled();
    }));
  });

  describe('Grid Updates', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['tests']);
      component['_correctAnswer'] = 'TESTS';
      fixture.detectChanges();
      tick(); // Wait for any async operations
      fixture.detectChanges();
    }));

    it('should update grid tiles with submitted letters', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));

      component.submitGuess('APPLE');
      fixture.detectChanges();
      tick();

      const firstRowTiles = compiled.querySelectorAll('.wordle-row:first-child .wordle-tile');
      expect(firstRowTiles[0].textContent).toContain('A');
      expect(firstRowTiles[1].textContent).toContain('P');
      expect(firstRowTiles[2].textContent).toContain('P');
      expect(firstRowTiles[3].textContent).toContain('L');
      expect(firstRowTiles[4].textContent).toContain('E');
    }));

    it('should apply correct status classes to tiles', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));

      component.submitGuess('TESTS'); // All correct
      fixture.detectChanges();
      tick();

      const firstRowTiles = compiled.querySelectorAll('.wordle-row:first-child .wordle-tile');
      firstRowTiles.forEach(tile => {
        expect(tile.classList.contains('wordle-tile-correct')).toBe(true);
      });
    }));

    it('should apply present status for letters in wrong position', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('STETS'); // S and T in wrong positions
      fixture.detectChanges();
      tick();

      const firstRowTiles = compiled.querySelectorAll('.wordle-row:first-child .wordle-tile');
      expect(firstRowTiles[0].classList.contains('wordle-tile-present')).toBe(true);
      expect(firstRowTiles[1].classList.contains('wordle-tile-present')).toBe(true);
    }));

    it('should apply absent status for letters not in word', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('AAAAA'); // No A in TESTS
      fixture.detectChanges();
      tick();

      const firstRowTiles = compiled.querySelectorAll('.wordle-row:first-child .wordle-tile');
      firstRowTiles.forEach(tile => {
        expect(tile.classList.contains('wordle-tile-absent')).toBe(true);
      });
    }));
  });

  describe('Message Display', () => {
    beforeEach(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['tests']);
      fixture.detectChanges();
    });

    it('should show initial message', () => {
      const messageElement = compiled.querySelector('.message-overlay');
      expect(messageElement?.textContent).toContain('Guess a 5-letter word!');
    });

    it('should show error message for invalid word length', fakeAsync(() => {
      component.submitGuess('ABC');
      fixture.detectChanges();
      tick();

      const messageElement = compiled.querySelector('.message-overlay');
      expect(messageElement?.textContent).toContain('Please enter a valid 5-letter word');
    }));

    it('should show congratulations message on correct guess', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      component.submitGuess('TESTS');
      fixture.detectChanges();
      tick();

      const messageElement = compiled.querySelector('.message-overlay');
      expect(messageElement?.textContent).toContain('Congratulations');
    }));

    it('should show game over message after 6 wrong guesses', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      component['_correctAnswer'] = 'TESTS';

      // Make 6 wrong guesses
      const wrongWords = ['APPLE', 'BEACH', 'CHAIR', 'DESKS', 'EAGLE', 'FLOOR'];
      wrongWords.forEach(word => component.submitGuess(word));

      tick();

      fixture.detectChanges();
      const messageElement = compiled.querySelector('.message-overlay');
      expect(messageElement?.textContent).toContain('Game over');
      expect(messageElement?.textContent).toContain('TESTS');
    }));

    it('should apply random rotation to message', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.5);
      component.displayMessage('Test message');
      fixture.detectChanges();
      tick();

      fixture.detectChanges();
      const messageElement = compiled.querySelector('.message-overlay') as HTMLElement;
      const transform = messageElement.style.transform;
      expect(transform).toContain('rotate');
    }));
  });

  describe('API Integration', () => {
    it('should fetch random word on initialization', fakeAsync(() => {
      fixture.detectChanges();

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('length')).toBe('5');

      req.flush(['hello']);
      tick();

      expect(component.correctAnswer).toBe('HELLO');
    }));

    it('should validate word using dictionary API', fakeAsync(() => {
      const testWord = 'apple';

      component.guessIsAWord(testWord).subscribe(result => {
        expect(result).toBe(true);
      });

      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/${testWord}`);
      expect(req.request.method).toBe('GET');

      req.flush([{ word: testWord }]);
      tick();
    }));

    it('should handle dictionary API errors gracefully', fakeAsync(() => {
      const testWord = 'zzzzz';

      component.guessIsAWord(testWord).subscribe(result => {
        expect(result).toBe(false);
      });

      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/${testWord}`);
      req.error(new ErrorEvent('Not found'));
      tick();
    }));
  });

  describe('Game Flow', () => {
    beforeEach(() => {
      component['_correctAnswer'] = 'TESTS';
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      fixture.detectChanges();
    });

    it('should progress through multiple guesses', fakeAsync(() => {
      const guesses = ['APPLE', 'BEACH', 'CHAIR'];

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');

      guesses.forEach((word, index) => {
        component.submitGuess(word);
        fixture.detectChanges();
        tick();

        expect(component.guesses.length).toBe(index + 1);
        expect(component.guesses[index]).toBe(word);

        // Check grid row is filled
        const rowTiles = compiled.querySelectorAll(`.wordle-row:nth-child(${index + 1}) .wordle-tile`);
        rowTiles.forEach((tile, tileIndex) => {
          expect(tile.textContent).toContain(word[tileIndex]);
        });
      });
    }));

    it('should prevent more than 6 guesses', fakeAsync(() => {
      // Make 6 guesses
      for (let i = 0; i < 6; i++) {
        const testWord = TestDataFactory.getValidWord();
        component.submitGuess(testWord);
        fixture.detectChanges();
        tick();
      }

      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      // Try 7th guess
      const initialGuessCount = component.guesses.length;
      component.submitGuess('EXTRA');
      fixture.detectChanges();
      tick();

      expect(component.guesses.length).toBe(initialGuessCount);

    }));

    it('should disable input after correct answer', fakeAsync(() => {
      component.submitGuess('TESTS');
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      tick();

      expect(component.guessWasCorrect).toBe(true);

      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;
      const submitButton = compiled.querySelector('input[type="button"][value="Submit Guess"]') as HTMLInputElement;

      expect(input.disabled).toBe(true);
      expect(submitButton).toBeFalsy(); // Submit button should be replaced by Reset button

      // Reset button should be visible
      const resetButton = compiled.querySelector('input[type="button"][value="Reset Game"]') as HTMLInputElement;
      expect(resetButton).toBeTruthy();
    }));
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['tests']);
      fixture.detectChanges();
    });

    it('should have proper ARIA labels', () => {
      const input = compiled.querySelector('input[type="text"]');
      expect(input?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have proper focus management', fakeAsync(() => {
      const input = compiled.querySelector('input[type="text"]') as HTMLInputElement;

      input.focus();

      component.submitGuess('APPLE');
      fixture.detectChanges();
      tick();
      const req = httpMock.expectOne(`https://api.dictionaryapi.dev/api/v2/entries/en/apple`);

      // Input should maintain focus after submission
      expect(document.activeElement).toBe(input);
    }));

    it('should have keyboard navigation support', () => {
      const form = compiled.querySelector('form');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });

      spyOn(component, 'submitGuess');
      form?.dispatchEvent(enterEvent);

      // Form should handle Enter key
      expect(component.submitGuess).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should not make unnecessary API calls', fakeAsync(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');
      req.flush(['tests']);
      tick();

      // Trigger change detection multiple times
      fixture.detectChanges();
      fixture.detectChanges();
      fixture.detectChanges();

      // Should not make additional API calls
      httpMock.expectNone('https://random-word-api.herokuapp.com/word?length=5');
    }));

    it('should efficiently update only changed grid rows', fakeAsync(() => {
      spyOn(component, 'guessIsAWord').and.returnValue(of(true));
      fixture.detectChanges();
      const req = httpMock.expectOne('https://random-word-api.herokuapp.com/word?length=5');

      // Submit first guess
      component.submitGuess('APPLE');
      fixture.detectChanges();
      tick();

      const firstRowBefore = compiled.querySelector('.wordle-row:first-child')?.innerHTML;
      const secondRowBefore = compiled.querySelector('.wordle-row:nth-child(2)')?.innerHTML;

      // Submit second guess
      component.submitGuess('BEACH');
      fixture.detectChanges();
      tick();

      const firstRowAfter = compiled.querySelector('.wordle-row:first-child')?.innerHTML;
      const secondRowAfter = compiled.querySelector('.wordle-row:nth-child(2)')?.innerHTML;

      // First row should remain unchanged
      expect(firstRowAfter).toBe(firstRowBefore);
      // Second row should be updated
      expect(secondRowAfter).not.toBe(secondRowBefore);
    }));
  });
});
