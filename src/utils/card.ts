// src/types/card.d.ts
declare module 'card' {
    export interface CardOptions {
      form: string;
      container: string;
      formSelectors: {
        numberInput: string;
        expiryInput: string;
        cvcInput: string;
        nameInput: string;
      };
    }
  
    export default class Card {
      constructor(options: CardOptions);
    }
  }
  