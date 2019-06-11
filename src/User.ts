// https://firebase.google.com/docs/web/setup?authuser=0
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7y2-C386xX3FDq9San2_9rkK04es_rm0",
  authDomain: "spanish-2b1c8.firebaseapp.com",
  databaseURL: "https://spanish-2b1c8.firebaseio.com",
  projectId: "spanish-2b1c8",
  storageBucket: "spanish-2b1c8.appspot.com",
  messagingSenderId: "40880106078",
  appId: "1:40880106078:web:ce36ffc98b033286"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().useDeviceLanguage();

// https://firebase.google.com/docs/firestore/manage-data/enable-offline?authuser=0
firebase
  .firestore()
  .enablePersistence()
  .catch(function(err) {
    if (err.code == "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      // ...
    } else if (err.code == "unimplemented") {
      // The current browser does not support all of the
      // features required to enable persistence
      // ...
    }
  });
const db = firebase.firestore();
class User {
  public static getInstance(): User {
    if (!User._instance) {
      User._instance = new User();
    }
    return User._instance;
  }
  private static _instance: User;

  public flashCards: FlashCard[] = [];
  public data: EnteriesMap = {};

  public dataRetrieved: boolean = false;
  private authToken: string = "";
  private user: firebase.User | null = null;
  private flashCardSubscribers: any[] = [];
  constructor() {
    const me = this;
    firebase.auth().onAuthStateChanged(user => {
      me.user = user;
      if (user) {
        //user logged in.
        console.log("user is not null;");
        me.fetchData();
      } else {
        console.log("user is null");
      }
      console.log("something happened in login state!!", user);
    });
    firebase
      .auth()
      .getRedirectResult()
      .then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = (result.credential as any).accessToken;
          me.authToken = token;
          // ...
        }
        // The signed-in user info.
        var user = result.user;
        me.user = user;
        // me.fetchData();
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  }

  toFlashCards(): FlashCard[] {
    console.log("attempt make flashcards");
    if (this.flashCards.length > 1) {
      this.flashCards = [];
    }
    if (this.data) {
      for (const k in this.data) {
        const entr: EntryValue = this.data[k];
        this.flashCards.push(new FlashCard(k, entr));
        if (entr.reverse) {
          this.flashCards.push(new FlashCard(k, entr, false));
        }
      }
      console.log("flashcards made");
    }
    return this.flashCards;
  }
  signIn() {
    firebase.auth().signInWithRedirect(provider);
  }
  signOut() {
    const me = this;
    firebase
      .auth()
      .signOut()
      .then(function() {
        // Sign-out successful.
        me.authToken = "";
      })
      .catch(function(error) {
        // An error happened.
        console.log("oh shit. couldn't log out");
      });
  }
  isSignedIn(): boolean {
    return this.user ? true : false;
    // return this.authToken.length > 0;
  }
  async fetchData() {
    if (this.user) {
      console.log("fetching data...");
      var docRef = db.collection("users").doc(this.user.uid);
      //   console.log(docRef);
      (window as any).doc = docRef;
      const x = await docRef.get();
      const dat = x.data();
      if (dat) {
        for (const k in dat) {
          this.data[k] = toEntryValue(dat[k]);
        }
        // this.data = dat;
        // console.log("map data:", this.data);
        // console.log("map data as toJSON:", JSON.stringify(this.data));
      }
      //set Flashcards
      this.toFlashCards();
      this.dataRetrieved = true;
      return this.data;
    }
  }
  setData(data: any = this.data): Promise<void> {
    console.log("setting data using:", data);
    if (this.user) {
      var docRef = db.collection("users").doc(this.user.uid);
      //   console.log(docRef);
      (window as any).doc = docRef;
      return docRef.set(data as firebase.firestore.DocumentData, { merge: true });
    } else {
      return Promise.reject("No User logged in");
    }
  }
}
function toEntryValue(entryObj: any): EntryValue {
  let stuff: EntryValue = entryObj as EntryValue;
  if (!stuff) stuff = {} as EntryValue;
  if (!stuff.value) stuff.value = "";
  if (!stuff.reverse) stuff.reverse = false;
  if (stuff.created instanceof firebase.firestore.Timestamp) stuff.created = stuff.created.toDate();
  if (!stuff.stats) {
    stuff.stats = emptyStats();
  }
  //   { got: [], missed: [], reverseGot: [], reverseMissed: [] };
  for (const k of ["got", "missed", "reverseGot", "reverseMissed"]) {
    // console.log(k);
    (stuff.stats as any)[k] = toDates((stuff.stats as any)[k]);
  }
  return stuff;
}
function toDates(arr: any[]): Date[] {
  return arr.map(x => x.toDate());
}
export function emptyStats(): Stats {
  const a: Stats = { got: [], missed: [], reverseGot: [], reverseMissed: [] };
  return a;
}
export default User.getInstance();
export interface EnteriesMap {
  [s: string]: EntryValue;
}
export interface EntryValue {
  value: string;
  reverse: boolean;
  created: Date;
  stats: Stats;
}
export interface Stats {
  got: Date[];
  missed: Date[];
  reverseGot: Date[];
  reverseMissed: Date[];
}
export class FlashCard {
  public importance: number = 0;

  constructor(private _key: string, private entryValue: EntryValue, public forwards: boolean = true) {
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
  addFailure(date = new Date()) {
    const dat = User.getInstance().data;
    if (this.forwards) {
      dat[this._key].stats.missed.push(date);
    } else {
      dat[this._key].stats.reverseMissed.push(date);
    }
  }
  addSuccess(date = new Date()) {
    const dat = User.getInstance().data;
    if (this.forwards) {
      dat[this._key].stats.got.push(date);
    } else {
      dat[this._key].stats.reverseGot.push(date);
    }
  }
  setDefaultImportance() {
    // const daysAgoAdded = (new Date().getTime() - this.entryValue.created.getTime()) / (1000 * 60 * 60 * 24);
    const successRate = this.successRate;
    // console.log("setting importance", this);
    const lastSeenAgoMS = new Date().getTime() - this.lastTested.getTime();
    const lastSeenDays = lastSeenAgoMS / (1000 * 60 * 60 * 24);
    //the more recently
    this.importance = 1 / successRate + lastSeenDays * 0.4 + (Math.random() < 0.5 ? -1 : 1) * Math.random();
  }
  get key() {
    return this.forwards ? this._key : this.entryValue.value;
  }
  get value() {
    return this.forwards ? this.entryValue.value : this._key;
  }
  get corrects() {
    return this.forwards ? this.entryValue.stats.got : this.entryValue.stats.reverseGot;
  }
  get incorrects() {
    return this.forwards ? this.entryValue.stats.missed : this.entryValue.stats.reverseMissed;
  }
  get successRate() {
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
  //   get lastTested(): Date {
  //     return this.lastRight > this.lastWrong ? this.lastRight : this.lastWrong;
  //   }
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
