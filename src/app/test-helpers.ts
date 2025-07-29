/**
 * Common test utilities and helpers for Wordley Durdley tests
 */

import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Helper class for common test utilities
 */
export class TestHelpers {
  /**
   * Finds an element by CSS selector
   */
  static findByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
    return fixture.debugElement.query(By.css(selector));
  }

  /**
   * Finds all elements by CSS selector
   */
  static findAllByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  /**
   * Gets the text content of an element
   */
  static getText<T>(fixture: ComponentFixture<T>, selector: string): string | null {
    const element = TestHelpers.findByCss(fixture, selector);
    return element ? element.nativeElement.textContent : null;
  }

  /**
   * Clicks an element
   */
  static click<T>(fixture: ComponentFixture<T>, selector: string): void {
    const element = TestHelpers.findByCss(fixture, selector);
    if (element) {
      element.nativeElement.click();
      fixture.detectChanges();
    }
  }

  /**
   * Sets input value and triggers input event
   */
  static setInputValue<T>(fixture: ComponentFixture<T>, selector: string, value: string): void {
    const element = TestHelpers.findByCss(fixture, selector);
    if (element) {
      const input = element.nativeElement as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  }

  /**
   * Triggers a keyboard event
   */
  static triggerKeyboardEvent<T>(
    fixture: ComponentFixture<T>,
    selector: string,
    eventType: string,
    key: string
  ): void {
    const element = TestHelpers.findByCss(fixture, selector);
    if (element) {
      const event = new KeyboardEvent(eventType, { key });
      element.nativeElement.dispatchEvent(event);
      fixture.detectChanges();
    }
  }

  /**
   * Checks if element has a CSS class
   */
  static hasClass<T>(fixture: ComponentFixture<T>, selector: string, className: string): boolean {
    const element = TestHelpers.findByCss(fixture, selector);
    return element ? element.nativeElement.classList.contains(className) : false;
  }

  /**
   * Gets computed style of an element
   */
  static getStyle<T>(fixture: ComponentFixture<T>, selector: string, property: string): string {
    const element = TestHelpers.findByCss(fixture, selector);
    if (element) {
      return window.getComputedStyle(element.nativeElement).getPropertyValue(property);
    }
    return '';
  }

  /**
   * Waits for async operations
   */
  static async waitForAsync(ms: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a mock HTTP response
   */
  static createMockHttpResponse<T>(data: T, status: number = 200): any {
    return {
      data,
      status,
      statusText: 'OK',
      headers: {},
      config: {},
      request: {}
    };
  }

  /**
   * Creates a mock HTTP error
   */
  static createMockHttpError(message: string, status: number = 404): any {
    return {
      error: { message },
      status,
      statusText: 'Error',
      headers: {},
      config: {},
      request: {}
    };
  }

  /**
   * Generates a random 5-letter word for testing
   */
  static generateRandomWord(length: number = 5): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let word = '';
    for (let i = 0; i < length; i++) {
      word += letters[Math.floor(Math.random() * letters.length)];
    }
    return word;
  }

  /**
   * Creates a mock grid tile
   */
  static createMockTile(letter: string = '', status: string = '', index: number = 0): any {
    return { letter, status, index };
  }

  /**
   * Creates a mock grid row
   */
  static createMockRow(length: number = 5): any[] {
    return Array.from({ length }, (_, i) => TestHelpers.createMockTile('', '', i));
  }

  /**
   * Creates a mock grid
   */
  static createMockGrid(rows: number = 6, cols: number = 5): any[][] {
    return Array.from({ length: rows }, () => TestHelpers.createMockRow(cols));
  }

  /**
   * Asserts grid state
   */
  static assertGridState(
    grid: any[][],
    expectedRow: number,
    expectedWord: string,
    expectedStatuses: string[]
  ): void {
    const row = grid[expectedRow];
    expect(row.length).toBe(expectedWord.length);

    for (let i = 0; i < expectedWord.length; i++) {
      expect(row[i].letter).toBe(expectedWord[i]);
      expect(row[i].status).toBe(expectedStatuses[i]);
    }
  }

  /**
   * Creates a spy object for HttpClient
   */
  static createHttpClientSpy(): any {
    return jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete', 'patch']);
  }

  /**
   * Flushes all pending timers in tests
   */
  static flushTimers(clock: jasmine.Clock, time: number): void {
    clock.tick(time);
  }
}

/**
 * Custom Jasmine matchers for component testing
 */
export const customMatchers = {
  toHaveText: () => ({
    compare: (actual: HTMLElement, expected: string) => {
      const actualText = actual.textContent?.trim() || '';
      const pass = actualText === expected;
      return {
        pass,
        message: pass
          ? `Expected element not to have text "${expected}"`
          : `Expected element to have text "${expected}" but got "${actualText}"`
      };
    }
  }),

  toHaveClass: () => ({
    compare: (actual: HTMLElement, expected: string) => {
      const pass = actual.classList.contains(expected);
      return {
        pass,
        message: pass
          ? `Expected element not to have class "${expected}"`
          : `Expected element to have class "${expected}"`
      };
    }
  }),

  toBeVisible: () => ({
    compare: (actual: HTMLElement) => {
      const style = window.getComputedStyle(actual);
      const pass = style.display !== 'none' &&
                   style.visibility !== 'hidden' &&
                   style.opacity !== '0';
      return {
        pass,
        message: pass
          ? 'Expected element not to be visible'
          : 'Expected element to be visible'
      };
    }
  })
};

/**
 * Test data factory for creating common test data
 */
export class TestDataFactory {
  static readonly VALID_WORDS = [
    'APPLE', 'BEACH', 'CHAIR', 'DESKS', 'EAGLE',
    'FLOOR', 'GRAPE', 'HOUSE', 'IMAGE', 'JUICE'
  ];

  static readonly INVALID_WORDS = [
    'ABC', 'ABCDE', 'ZYXWV', 'XXXXX', '12345'
  ];

  static getValidWord(): string {
    return this.VALID_WORDS[Math.floor(Math.random() * this.VALID_WORDS.length)];
  }

  static getInvalidWord(): string {
    return this.INVALID_WORDS[Math.floor(Math.random() * this.INVALID_WORDS.length)];
  }

  static createGuessHistory(count: number, correctAnswer?: string): string[] {
    const guesses: string[] = [];
    for (let i = 0; i < count; i++) {
      guesses.push(this.getValidWord());
    }
    return guesses;
  }

  static createGameState(guessCount: number, correctAnswer: string = 'TESTS'): any {
    return {
      correctAnswer,
      guesses: this.createGuessHistory(guessCount),
      grid: TestHelpers.createMockGrid(),
      invalidGuess: false,
      showMessage: false,
      messageText: '',
      messageAngle: 0
    };
  }
}

/**
 * Async test helpers
 */
export class AsyncTestHelpers {
  static async resolveAfter<T>(value: T, delay: number = 0): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value), delay));
  }

  static async rejectAfter<T>(error: any, delay: number = 0): Promise<T> {
    return new Promise((_, reject) => setTimeout(() => reject(error), delay));
  }

  static flushMicrotasks(): Promise<void> {
    return Promise.resolve();
  }

  static async waitForCondition(
    condition: () => boolean,
    timeout: number = 3000,
    interval: number = 50
  ): Promise<void> {
    const startTime = Date.now();

    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Condition not met within timeout');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}
