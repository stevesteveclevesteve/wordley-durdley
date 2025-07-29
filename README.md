# Wordleydurdley

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.3.  Manually updated to version 20. 

## Functionality

This is a word-guessing game, the same as the 'Wordle' game.  The user has six chances to correctly guess a five letter word.  The user enters a guess into the text box and the correctness of each letter of the guess is revealed.  Green for letter in the correct place, yellow for letter in the word but not in the correct place, and gray for letter not present in the word.  There will never be more green plus yellow tiles for a given letter than the number of occurrences of the letter in the target word. For example, if the target word is 'CHECK' and the user guesses 'PEACE', the first 'E' in 'PEACE' will be revealed in yellow, and the second in gray.  If the target word is 'SIEVE' and the guess is 'GREEN', the first 'E' in 'GREEN' will be green, and the second in yellow.  If the user correctly guesses the word and all five tiles are green, the user wins and the game ends.  If the user exhausts all six of their tries and does not guess the correct word, their game ends.

## Under the hood

This project uses http client to fetch a random 5 letter English word from https://random-word-api.herokuapp.com/word API.  A rolling representation of the progress of the game is displayed in a FlexGrid.  The user enters their guess into a standard text input.  Each entry is first confirmed to be a real word using an http client call to https://api.dictionaryapi.dev/api/v2/entries/en/{word} API.  This API happens to use an array of objects response when the word is found but a simple object when the word is not, so deserialization of the response into an array is considered verification that the submission is a word.  After verification, the color for each tile representing the letters of the current guess are assigned colors via CSS.  A text div uses @for to keep the user informed of the next step.  If the player guesses the word correctly, a subtle animation of the winning guess adds a little visual appeal to the result.  Once the player guesses correctly or exhausts their attempts, the button to reset the game becomes active, a new target word is fetched from the API, and the guess history is reinitialized.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


# Wordley Durdley Test Suite Documentation

## Overview
This comprehensive test suite provides unit and integration tests for the Wordley Durdley Angular application, a Wordle-like game implementation.

## Test Files

### 1. `app.component.spec.ts`
**Main component unit tests**
- **Coverage**: ~95% of AppComponent functionality
- **Test Count**: 50+ test cases
- **Key Areas**:
  - Component initialization
  - Getter methods (correctAnswer, guessWasCorrect, canReset)
  - Display message functionality
  - Game message logic
  - Guess submission and validation
  - Word validation API integration
  - Game reset functionality
  - Integration scenarios

### 2. `app.component.integration.spec.ts`
**Integration and UI tests**
- **Test Count**: 30+ test cases
- **Key Areas**:
  - UI rendering verification
  - User interaction testing
  - Grid update mechanisms
  - Message display functionality
  - API integration testing
  - Complete game flow scenarios
  - Accessibility features
  - Performance optimization tests

### 3. `app.config.spec.ts`
**Application configuration tests**
- **Test Count**: 5 test cases
- **Coverage**: Application configuration and provider setup
- **Key Areas**:
  - Configuration object structure
  - Provider availability
  - Router service configuration
  - HttpClient configuration with fetch

### 4. `app.routes.spec.ts`
**Routing configuration tests**
- **Test Count**: 5 test cases
- **Coverage**: Route configuration
- **Key Areas**:
  - Routes array structure
  - Empty routes verification
  - Type safety checks
  - Future route validation setup

### 5. `main.spec.ts`
**Bootstrap function tests**
- **Test Count**: 10 test cases
- **Coverage**: Application bootstrap process
- **Key Areas**:
  - Bootstrap function calls
  - Error handling
  - Console error logging
  - Promise resolution/rejection

### 6. `test-helpers.ts`
**Testing utilities and helpers**
- **Features**:
  - Common test utility functions
  - Custom Jasmine matchers
  - Test data factory
  - Async test helpers
  - Mock data generators

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test -- --code-coverage
```

### Run specific test file
```bash
npm run test -- --include='**/app.component.spec.ts'
```

### Run tests in watch mode
```bash
npm run test -- --watch
```

### Run tests in headless mode
```bash
npm run test -- --browsers=ChromeHeadless
```

## Test Structure

### Unit Test Pattern
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Feature/Method', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Integration Test Pattern
```typescript
describe('Feature Integration', () => {
  // Component setup

  it('should handle complete user flow', fakeAsync(() => {
    // User actions
    // API calls
    // UI updates
    // Assertions
  }));
});
```

## Mock Data

### Valid Test Words
- APPLE, BEACH, CHAIR, DESK, EAGLE, FLOOR, GRAPE, HOUSE, IMAGE, JUICE

### Test Scenarios
1. **Correct Guess**: Word matches answer exactly
2. **Present Letters**: Letters in word but wrong position
3. **Absent Letters**: Letters not in the word
4. **Duplicate Letters**: Handling multiple occurrences
5. **Invalid Words**: Non-dictionary words
6. **Invalid Length**: Words not exactly 5 letters

## Coverage Goals

### Target Coverage
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

### Current Coverage Areas
- ✅ Component lifecycle
- ✅ User interactions
- ✅ API integrations
- ✅ Game logic
- ✅ UI updates
- ✅ Error handling
- ✅ Edge cases

## Testing Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Clean up in `afterEach`

### 2. Descriptive Names
- Use clear, descriptive test names
- Follow "should [expected behavior] when [condition]" pattern

### 3. AAA Pattern
- **Arrange**: Set up test data
- **Act**: Execute the function
- **Assert**: Verify the result

### 4. Mock External Dependencies
```typescript
spyOn(component, 'methodName').and.returnValue(mockValue);
httpMock.expectOne(url).flush(mockData);
```

### 5. Async Testing
```typescript
// For promises
it('should...', async () => {
  await component.asyncMethod();
  expect(result).toBe(expected);
});

// For observables
it('should...', fakeAsync(() => {
  component.observableMethod().subscribe();
  tick();
  expect(result).toBe(expected);
}));
```

## Common Test Utilities

### TestHelpers Class
```typescript
TestHelpers.findByCss(fixture, '.class-name');
TestHelpers.click(fixture, 'button');
TestHelpers.setInputValue(fixture, 'input', 'value');
TestHelpers.hasClass(fixture, '.element', 'class-name');
```

### TestDataFactory
```typescript
TestDataFactory.getValidWord();
TestDataFactory.createGuessHistory(3);
TestDataFactory.createGameState(2, 'TESTS');
```

## Debugging Tests

### Debug single test
```typescript
fdescribe('ComponentName', () => {  // Focus on this suite
  fit('should...', () => {           // Focus on this test
    debugger;                        // Add breakpoint
  });
});
```

### View test output
```bash
npm run test -- --no-watch --browsers=Chrome
```

### Increase timeout for debugging
```typescript
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // 10 seconds
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run tests
  run: npm test -- --no-watch --code-coverage --browsers=ChromeHeadless
```

### Coverage Reports
- Generated in `/coverage` directory
- HTML report at `/coverage/index.html`
- Can be integrated with services like Codecov or Coveralls

## Troubleshooting

### Common Issues

1. **HTTP requests not mocked**
   - Ensure `HttpClientTestingModule` is imported
   - Verify all requests with `httpMock.verify()`

2. **Async tests timing out**
   - Use `fakeAsync` and `tick()`
   - Increase timeout if needed

3. **Change detection issues**
   - Call `fixture.detectChanges()` after state changes
   - Use `tick()` for async operations

4. **Spy not called**
   - Verify spy is created before the action
   - Check method names match exactly

## Contributing

### Adding New Tests
1. Follow existing patterns
2. Maintain high coverage
3. Test edge cases
4. Document complex test scenarios
5. Run full suite before committing

### Test Review Checklist
- [ ] Tests are isolated and independent
- [ ] Names clearly describe what is being tested
- [ ] Both positive and negative cases covered
- [ ] Async operations properly handled
- [ ] Mocks and spies cleaned up
- [ ] No hardcoded values (use constants/factory)
- [ ] Comments explain complex scenarios

## Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/index.html)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
