# Implementation of Udacity&rsquo;s Classic Arcade Game

## Using

Clone the repository. Open `index.html`. Have fun!

## TypeScript

This is written in TypeScript, which has been compiled to JavaScript. While the compiled JavaScript is generally idiomatic, the facility for handling `enum`s and for extending classes (with a call to `super` to invoke the superclass&rsquo;s constructor) might be initially confusing. TypeScript also uses interfaces, which are simply absent from the compiled JavaScript. So consider viewing the source TypeScript files for context.

## The `engine.js` file

I have substantially overhauled the `engine.js` file for two reasons. First, I did not like using the global namespace for variables. Second, I wanted to make more use of constants to get rid of the many magic constants in the file and to permit changing constants at a single point.

## Difficulty levels

I have implemented selectable difficulty levels to attempt to satisfy the _Exceeds Specifications_ standard on the rubric. This is implemented by speeding up the bugs and slowing down the player at harder difficulty levels.

## Testing

I have stubbed out the beginning of a test suite using Jasmine. Open the `unit-tests.html` file to see the initial tests. Exporting tests using require.js proved somewhat difficulty, but I think I figure it out.
