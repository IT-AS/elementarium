import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StringGeneratorService {

  private animals: string[] = ["Aardvark", "Albatross", "Alligator", "Alpaca", "Ant", "Anteater", "Antelope", "Ape", "Armadillo", "Baboon", "Badger", "Barracuda", "Bat", "Bear", "Beaver", "Bee", "Bison", "Boar", "Buffalo", "Butterfly", "Camel", "Capybara", "Caribou", "Cassowary", "Cat", "Caterpillar", "Cattle", "Chameleon", "Cheetah", "Chicken", "Chimpanzee", "Chinchilla", "Chipmunk", "Clam", "Cobra", "Cockroach", "Cod", "Coyote", "Crab", "Crane", "Crocodile", "Crow", "Cuckoo", "Deer", "Dingo", "Dog", "Dolphin", "Donkey", "Dove", "Dragonfly", "Duck", "Dugong", "Eagle", "Echidna", "Elephant", "Elk", "Emu", "Falcon", "Ferret", "Finch", "Fish", "Flamingo", "Fly", "Fox", "Frog", "Gazelle", "Giraffe", "Gnu", "Goat", "Goldfish", "Goose", "Gorilla", "Grasshopper", "Gull", "Hamster", "Hare", "Hedgehog", "Heron", "Hippopotamus", "Horse", "Hummingbird", "Hyena", "Iguana", "Impala", "Jackal", "Jaguar", "Jellyfish", "Kangaroo", "Koala", "Kudu", "Leopard", "Lion", "Llama", "Lobster", "Lynx", "Mongoose", "Monkey", "Moose", "Mouse", "Narwhal", "Newt", "Ocelot", "Octopus", "Opossum", "Orangutan", "Ostrich", "Otter", "Owl", "Ox", "Oyster", "Panda", "Parrot", "Peacock", "Pelican", "Penguin", "Pheasant", "Pig", "Pigeon", "Platypus", "Porcupine", "Porpoise", "Puma", "Quail", "Quokka", "Rabbit", "Raccoon", "Rat", "Rattlesnake", "Raven", "Reindeer", "Rhinoceros", "Salamander", "Salmon", "Seahorse", "Seal", "Shark", "Sheep", "Shrimp", "Skunk", "Sloth", "Snail", "Snake", "Sparrow", "Spider", "Squid", "Squirrel", "Starfish", "Stingray", "Swan", "Tapir", "Tarsier", "Termite", "Tiger", "Toad", "Tortoise", "Toucan", "Tuna", "Turkey", "Turtle", "Viper", "Vulture", "Wallaby", "Walrus", "Wasp", "Weasel", "Whale", "Wolf", "Wolverine", "Wombat", "Woodpecker", "Worm", "Xerus"];
  private adjectives: string[] = ["Adorable", "Adventurous", "Aggressive", "Amazing", "Angry", "Anxious", "Arrogant", "Attractive", "Average", "Awful", "Beautiful", "Bitter", "Boring", "Brave", "Bright", "Bumpy", "Calm", "Careful", "Charming", "Cheerful", "Clumsy", "Cold", "Compassionate", "Confident", "Confused", "Cool", "Courageous", "Crazy", "Creepy", "Cruel", "Curious", "Cute", "Dangerous", "Dark", "Delightful", "Demanding", "Depressed", "Determined", "Different", "Difficult", "Disgusted", "Dull", "Eager", "Easy", "Elegant", "Embarrassed", "Energetic", "Enthusiastic", "Envious", "Excited", "Famous", "Fancy", "Fantastic", "Fierce", "Filthy", "Fine", "Foolish", "Friendly", "Frightened", "Funny", "Generous", "Gentle", "Glamorous", "Gleaming", "Glorious", "Gorgeous", "Graceful", "Grateful", "Grouchy", "Handsome", "Happy", "Healthy", "Helpful", "Hilarious", "Hungry", "Innocent", "Interesting", "Jolly", "Joyful", "Kind", "Lazy", "Lively", "Lonely", "Lovely", "Lucky", "Magnificent", "Marvelous", "Mysterious", "Nasty", "Naughty", "Nervous", "Nice", "Obedient", "Obnoxious", "Odd", "Old-fashioned", "Outrageous", "Perfect", "Plain", "Pleasant", "Polite", "Proud", "Puzzled", "Quaint", "Real", "Relieved", "Repulsive", "Rich", "Scary", "Selfish", "Shiny", "Silly", "Sincere", "Sleepy", "Smiling", "Sour", "Splendid", "Stunning", "Successful", "Tense", "Terrible", "Thankful", "Thoughtful", "Tired", "Troubled", "Ugly", "Unusual", "Vivacious", "Witty", "Wonderful", "Worried", "Zealous", "Zany"];

  constructor() { }

  public generateGameName(): string {
    const id: number = Math.trunc(Math.random() * 999999);

    return 'Game' + id.toString().padStart(6, '0');
  }

  public generatePlayerName(): string {
    const animalId = Math.trunc(Math.random() * this.animals.length);
    const adjectiveId = Math.trunc(Math.random() * this.adjectives.length);

    return this.adjectives[adjectiveId] + this.animals[animalId];
  }

  public generatePassword(length: number = 8): string {
    return Math.random().toString(36).substr(2, length);
  }
}
