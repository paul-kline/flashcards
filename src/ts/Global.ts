import { User } from "./User";
import FlashCard from "./FlashCard";
import { CollectionMap, EntriesMap, FlashCardsMap, ToAdd } from "./Types";

export class Global {
  public static getInstance(): Global {
    if (!Global._instance) {
      Global._instance = new Global();
    }
    return Global._instance;
  }
  private static _instance: Global;
  public flashCards: FlashCard[] = [];
  public collectionNames: string[] = [];
  private _collections: CollectionMap = {};
  private _flashCardsCollection: FlashCardsMap = {};
  private user: User = User.getInstance();

  get isSignedIn() {
    return this.user.isSignedIn();
  }
  constructor() {
    console.log("global created");
    const me = this;
    this.user.subscribeToLogInEvent(async (u: firebase.User) => {
      me.collectionNames = await me.user.fetchCollectionNames();
      console.log("my collection names:", me.collectionNames);
    });
  }
  //   private async setCollectionNames() {
  //     console.log("in set collectionNames. this is:", this);
  //     this.collectionNames = await this.user.fetchCollectionNames();
  //   }
  public async getCollection(collectionName: string): Promise<EntriesMap> {
    const answer = this._collections[collectionName];
    if (answer) {
      return answer;
    } else {
      this._collections[collectionName] = await this.user.fetchCollection(collectionName);
      return this._collections[collectionName];
    }
  }
  public async getFlashCards(collectionName: string): Promise<FlashCard[]> {
    const answer = this._flashCardsCollection[collectionName];
    if (answer) {
      return answer;
    } else {
      //no one has made the flashcards yet!.
      const collection = await this.getCollection(collectionName);
      this._flashCardsCollection[collectionName] = FlashCard.toFlashCards(collection);
      return this._flashCardsCollection[collectionName];
    }
  }
  public async saveAndDeleteCollection(collectionName: string, toDelete: string[]) {
    await this.user.deleteFromCollection(collectionName, toDelete);
    return this.saveCollection(collectionName);
  }
  public async saveCollection(collectionName: string) {
    const collection = await this.getCollection(collectionName);
    return this.user.saveCollection(collectionName, collection);
  }
}
export default Global.getInstance();
