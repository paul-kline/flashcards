// https://firebase.google.com/docs/web/setup?authuser=0
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
import * as firebase from "firebase/app";

// Add the Firebase services that you want to use
import "firebase/auth";
import "firebase/firestore";
import { EntryValue, EntriesMap, Stats, emptyStats } from "./Types";
import FlashCard from "./FlashCard";
import ExtraPromise from "./ExtraPromise";

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
// const FieldValue = require("firebase-admin").firestore.FieldValue;
// https://firebase.google.com/docs/firestore/manage-data/enable-offline?authuser=0
firebase
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
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
export class User {
  public static getInstance(): User {
    if (!User._instance) {
      User._instance = new User();
    }
    return User._instance;
  }
  private static _instance: User;

  // public collectionMap;
  // public data: EntriesMap = {};

  public dataRetrieved: boolean = false;
  private authToken: string = "";
  private user: firebase.User | null = null;
  // private flashCardSubscribers: any[] = [];
  constructor() {
    const me = this;
    firebase.auth().onAuthStateChanged(user => {
      me.user = user;
      if (user) {
        //user logged in.
        console.log("user is not null;");
        // me.fetchData();
        // me. me.fetchCollectionNames();
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
          console.log("successfully got auth redirect results:", result);
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
    console.log("user created");
  }

  // toFlashCards(): FlashCard[] {
  //   console.log("attempt make flashcards");
  //   if (this.flashCards.length > 1) {
  //     this.flashCards = [];
  //   }
  //   if (this.data) {
  //     for (const k in this.data) {
  //       const entr: EntryValue = this.data[k];
  //       this.flashCards.push(new FlashCard(k, entr));
  //       if (entr.reverse) {
  //         this.flashCards.push(new FlashCard(k, entr, false));
  //       }
  //     }
  //     console.log("flashcards made");
  //   }
  //   return this.flashCards;
  // }
  subscribeToLogInEvent(f: (u: firebase.User) => any) {
    console.log("in add sub");
    firebase.auth().onAuthStateChanged(user => {
      console.log("in listener!!");
      if (user) {
        console.log("i think user is true:", user);
        f(user);
      } else {
        console.log("user is null");
      }
    });
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
  async fetchCollectionNames(): Promise<string[]> {
    if (this.user) {
      console.log("fetching collection names...");
      var docRef = db.collection("users").doc(this.user.uid);
      //   console.log(docRef);
      const x = await docRef.get();
      const dat = x.data();
      if (dat) {
        console.log("names are:", dat.collectionNames);
        return dat.collectionNames;
      } else {
        console.log("coulnd't find em!!!");
      }
      // //set Flashcards
      // this.toFlashCards();
      // this.dataRetrieved = true;
      // return this.data;
      throw "data did not exist";
    } else {
      throw "User does not exist";
    }
  }
  async fetchCollection(collectionName: string): Promise<EntriesMap> {
    if (this.user) {
      console.log("fetching collection: ", collectionName);
      const docRef = db
        .collection("users")
        .doc(this.user.uid)
        .collection("collections")
        .doc(collectionName);
      const preData = await docRef.get();
      const data = preData.data();
      const res = convertToEntriesMap(data);
      if (res) {
        return res;
      } else {
        console.error("something went wrong converting the retrieved collection: " + collectionName);
        return {} as EntriesMap;
      }
    } else {
      throw new Error("User did not exist when attempting to retrieve collection: " + collectionName);
    }
  }
  // async fetchData() {
  //   if (this.user) {
  //     console.log("fetching data...");
  //     var docRef = db.collection("users").doc(this.user.uid);
  //     console.log("docref for user is docRef", docRef);
  //     (window as any).docRef = docRef;
  //     const x = await docRef.get();
  //     const dat = x.data();
  //     console.log("SAVE THIS data is", dat);
  //     this.setCollection("spanish", dat);
  //     console.log("data tostr", JSON.stringify(dat));
  //     if (dat) {
  //       for (const k in dat) {
  //         // this.data[k] = toEntryValue(dat[k]);
  //       }
  //       // this.data = dat;
  //       // console.log("map data:", this.data);
  //       // console.log("map data as toJSON:", JSON.stringify(this.data));
  //     }
  //     //set Flashcards
  //     // this.toFlashCards();
  //     this.dataRetrieved = true;
  //     // return this.data;
  //   }
  // }

  deleteFromCollection(collectionName: string, keysToDelete: string[]): Promise<void> {
    if (this.user) {
      const obj = {} as any;
      keysToDelete.forEach(k => {
        obj[k] = firebase.firestore.FieldValue.delete();
      });
      return db
        .collection("users")
        .doc(this.user.uid)
        .collection("collections")
        .doc(collectionName)
        .update(obj);
    } else {
      return Promise.reject("User is not logged in. Could not delete anything from collection: " + collectionName);
    }
  }
  async saveCollection(collectionName: string, data: any, timeout: number = 5000): Promise<string> {
    if (this.user) {
      const docRef = db
        .collection("users")
        .doc(this.user.uid)
        .collection("collections")
        .doc(collectionName);
      //   console.log(docRef);
      // (window as any).doc = docRef;
      const ep = new ExtraPromise(docRef.set(data as firebase.firestore.DocumentData, { merge: true }));
      const r = ep.timeout(timeout, "Timeout Occurred");
      // const p = new Promise((resolve,reject)=>{

      // })
      return r.then(() => "Successfully saved."); //.catch(() => "Appear Offline. Try again later.");
    } else {
      return Promise.reject("No User logged in");
    }
  }
  // setData(data: any = this.data): Promise<void> {
  //   console.log("setting data using:", data);
  //   if (this.user) {
  //     var docRef = db.collection("users").doc(this.user.uid);
  //     //   console.log(docRef);
  //     (window as any).doc = docRef;
  //     return docRef.set(data as firebase.firestore.DocumentData, { merge: true });
  //   } else {
  //     return Promise.reject("No User logged in");
  //   }
  // }
}
function convertToEntriesMap(dat: any): EntriesMap | null {
  if (dat) {
    const answer = {} as EntriesMap;
    for (const k in dat) {
      answer[k] = toEntryValue(dat[k], k);
    }
    return answer;
  } else {
    return null;
  }
}
function toEntryValue(entryObj: any, key: string = ""): EntryValue {
  let stuff: EntryValue = entryObj as EntryValue;
  if (!stuff) stuff = {} as EntryValue;
  //set key always, i guess;
  stuff.key = key || stuff.key;
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

export default User.getInstance();
