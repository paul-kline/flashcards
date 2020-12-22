import { EntryValue, EntriesMap } from "./Types";
import user from "./User";
import { User } from "./User";

export default class FlashCard {
  public static toFlashCards(data: any): FlashCard[] {
    console.log("attempt make flashcards");
    const flashCards = [] as FlashCard[];
    if (data) {
      for (const k in data) {
        const entr: EntryValue = data[k];
        flashCards.push(new FlashCard(k, entr));
        if (entr.reverse) {
          flashCards.push(new FlashCard(k, entr, false));
        }
      }
      console.log("flashcards made");
    } else {
      console.log("data passed toFlashCards was null/false:", data);
    }
    return flashCards;
  }
  public _recommended: number | null = null;
  public _created: number | null = null;

  constructor(public _key: string, private entryValue: EntryValue, public forwards: boolean = true) {
    // this.setDefaultImportance();
  }
  removeLastAttempt() {
    const lastWrong = this.lastWrong;
    const lastRight = this.lastRight;
    if (!lastWrong) {
      //if no wrong exists, try to pop the last right. can fail just fine.
      this.corrects.pop();
    } else if (!lastRight) {
      //if no right exists, try to pop last fail.
      this.incorrects.pop();
    } else {
      //they both exist.
      if (lastWrong.getTime() > lastRight.getTime()) {
        //wrongs is most recent
        this.incorrects.pop();
      } else {
        //last right is more recent;
        this.corrects.pop();
      }
    }
  }
  addFailure(collection: EntriesMap, date = new Date()) {
    // const dat = User.getInstance().data;
    if (this.forwards) {
      collection[this._key].stats.missed.push(date);
    } else {
      collection[this._key].stats.reverseMissed.push(date);
    }
  }
  addSuccess(collection: EntriesMap, date = new Date()) {
    // const dat = User.getInstance().data;
    if (this.forwards) {
      collection[this._key].stats.got.push(date);
    } else {
      collection[this._key].stats.reverseGot.push(date);
    }
  }
  setRecommendation(): number {
    // const daysAgoAdded = (new Date().getTime() - this.entryValue.created.getTime()) / (1000 * 60 * 60 * 24);
    const successRate = this.successRate;
    // console.log("setting importance", this);
    const lastSeenAgoMS = new Date().getTime() - this.lastTested.getTime();
    const lastSeenDays = lastSeenAgoMS / (1000 * 60 * 60 * 24);
    //the more recently
    this._recommended = 1 / successRate + lastSeenDays * 0.4 + (Math.random() < 0.5 ? -1 : 1) * Math.random();
    return this._recommended;
  }
  get createdTime(): number {
    if (this._created == null) {
      const d = this.entryValue.created;
      this._created = (d && d.getTime()) || 0;
    }
    return this._created;
  }
  get recommended(): number {
    if (this._recommended == null) {
      this._recommended = this.setRecommendation();
    }
    return this._recommended;
  }
  get key(): string {
    return this.forwards ? this._key : this.entryValue.value;
  }
  get value(): string {
    return this.forwards ? this.entryValue.value : this._key;
  }
  get corrects(): Date[] {
    return this.forwards ? this.entryValue.stats.got : this.entryValue.stats.reverseGot;
  }
  get incorrects(): Date[] {
    return this.forwards ? this.entryValue.stats.missed : this.entryValue.stats.reverseMissed;
  }
  get successRate(): number {
    const corrects = this.corrects.length;
    const incorrects = this.incorrects.length;
    return corrects / (corrects + incorrects) || 0; //return 0% if div0 error NaN
  }
  get lastWrong(): Date | undefined {
    return this.incorrects[this.incorrects.length - 1];
  }
  get lastRight(): Date | undefined {
    return this.corrects[this.corrects.length - 1];
  }
  get lastTested(): Date {
    if (this.lastRight && this.lastWrong) {
      return this.lastRight > this.lastWrong ? this.lastRight : this.lastWrong;
    }
    return (
      this.lastRight ||
      this.lastWrong ||
      (() => {
        const x = new Date();
        x.setFullYear(1900);
        return x;
      })()
    );
  }
}
