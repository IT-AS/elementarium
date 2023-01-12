import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringGeneratorService {

  constructor() { }

  public generateName(): string {
    return 'Game';
  }

  public generatePassword(length: number = 8): string {
    return Math.random().toString(36).substr(2, length);
  }
}
