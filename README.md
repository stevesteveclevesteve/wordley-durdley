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
