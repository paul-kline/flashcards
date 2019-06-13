<template>
  <div class="container mx-auto" style="height:70vh;">
    <div class="options">
      <b-form-select
        v-if="collectionNames && collectionNames.length > 0"
        v-model="selectedCollection"
        :options="collectionNames"
        class="m-0"
        @input="collectionSelected"
      >
        <template slot="first">
          <option :value="null" disabled>-- Select a Collection --</option>
        </template>
      </b-form-select>
      <b-form-select v-model="selected" :options="options" class="mb-3" @input="selectionMade">
        <template slot="first">
          <option :value="null" disabled>-- Please select an option --</option>
        </template>

        <!-- This slot appears above the options from 'options' prop -->
      </b-form-select>
    </div>
    Cards Left ({{myCards.length}})
    <div class="flex-row">
      <div class="only-child">
        <b-button class="only-child" variant="success" v-if="!currentCard" @click="begin">Begin</b-button>
        <b-card
          header="Front"
          :title="currentCard.key"
          class="only-child flex-column card"
          v-else-if="front"
          @click="front = !front"
        ></b-card>
        <b-card
          v-else
          class="only-child center text-center"
          header="Back"
          :title="currentCard.value"
        >
          <div
            style="display:flex; flex-direction:column; justify-content:flex-end; align-items:stretch; height:80%;"
          >
            <div class="flex-row" style="align-items:stretch; flex-grow:1;">
              <b-button
                variant="danger"
                style="flex-grow:1;"
                class="btn m-1"
                @click="missed"
              >Missed it</b-button>
              <b-button variant="success" style="flex-grow:1;" class="btn m-1" @click="got">Got it</b-button>
            </div>
          </div>
        </b-card>
      </div>
    </div>
    <b-button class="align-left btn m-1" @click="undo">Undo</b-button>
    <b-button class="btn m-3" @click="saveProgress">{{saveStatusText}}</b-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
// import user from "@/ts/User";
import FlashCard from "@/ts/FlashCard";
import global from "@/ts/Global";
@Component({
  components: {
    SpanishText
  }
})
export default class PracticeVocab extends Vue {
  public name: string = "practicevocab";
  public allCards: FlashCard[] = [];
  public myCards: FlashCard[] = [];
  public history: FlashCard[] = [];
  public maxCards: number = 50;
  public currentCard: FlashCard | null = null;
  public selected: any = null;
  public selectedCollection: string | null = null;
  private myGlobal = global;

  public options = [
    {
      text: "Random",
      value: { text: "rando", func: this.randomize },
      disabled: false
    },
    {
      text: "Hardest",
      value: { text: "hard-on", func: this.byHardest },
      disabled: false
    },
    { text: "B", value: "Boo", disabled: false },
    { text: "C", value: "C", disabled: false },
    { text: "D", value: { d: 1 }, disabled: true },
    { text: "E", value: "E", disabled: false },
    { text: "F", value: "F", disabled: false }
  ];

  get collectionNames(): string[] | null {
    return this.myGlobal.collectionNames;
  }
  public front: boolean = true;
  public saveStatusText: string = "Save Status Online";
  async begin() {
    (window as any).me = this;
    console.log("starting");
    if (this.myCards.length < 1 && this.selectedCollection) {
      const collName = this.selectedCollection;
      const cards = await global.getFlashCards(collName);
      this.allCards = [...cards]; //create a copy list of links so I can eff with them.
      //also do selected sort.
      this.selected.func();
    }
    const hl = this.history.length;
    if (hl > 100) {
      this.history.splice(0, 100); //cap history to last 100 cards
    }
    this.currentCard = this.getNext();
    console.log("current card:", this.currentCard);
  }
  async collectionSelected(x: string) {
    // const collection = await this.myGlobal.getCollection(x);
    this.allCards = await this.myGlobal.getFlashCards(x);
    // this.myCards = FlashCard.toFlashCards(collection);
    // console.table(this.myCards.map(x => [x._key, x.key, x.value, x.forwards]));
  }
  selectionMade(x: any) {
    console.log("selection made");
    x.func();
  }
  randomize() {
    console.log("randiming");
    this.allCards.sort((a: FlashCard, b: FlashCard) => Math.random() - 0.5);
    this.myCards = this.allCards.slice(0, this.maxCards);

    console.log("random order", this.myCards.map(x => (x as any)._key));
  }
  byHardest() {
    console.log("sorting by hardest");
    this.allCards.sort(
      (a: FlashCard, b: FlashCard) => b.successRate - a.successRate
    );
    this.myCards = this.allCards.slice(0, this.maxCards);
  }
  async got() {
    //user got correct
    const c = this.currentCard;
    if (c && this.selectedCollection) {
      const coll = await global.getCollection(this.selectedCollection);
      c.addSuccess(coll);
    }
    this.nextTick();
  }
  nextTick() {
    if (this.currentCard) {
      this.history.push(this.currentCard);
    }
    this.currentCard = this.getNext();
    this.front = true;
    this.saveStatusText = "Save Status to Cloud (Unsaved changes)";
  }
  undo() {
    console.log("undo called");
    if (this.front) {
      if (this.history.length < 1) {
        //if ur already lookin at front and
        //no history, do nuthin.
        return;
      }
      this.front = false;
      if (this.currentCard) {
        //put back in deck, remove its recorded history.
        this.currentCard.removeLastAttempt();
        this.myCards.push(this.currentCard);
      }
      this.currentCard = this.history.pop() || null;
    } else {
      this.front = true;
    }
  }
  async missed() {
    //user missed, idiot
    const c = this.currentCard;
    if (c && this.selectedCollection) {
      const coll = await global.getCollection(this.selectedCollection);
      c.addFailure(coll);
    }
    this.nextTick();
  }
  mounted() {
    // this.myCards = [...user.flashCards];
    // this.myCards.sort(
    //   (a: FlashCard, b: FlashCard) => a.importance - b.importance
    // );
    // this.randomize();
  }
  getNext(attempts: number = 0): FlashCard | null {
    console.log("myCards", this.myCards);
    const proposedNextCard = this.myCards.pop();
    if (proposedNextCard) {
      if (attempts > 5) {
        //give up. 5 is enough.
        return proposedNextCard;
      }
      //make sure it isn't in the last 5
      const histLen = this.history.length;
      const last5 = this.history.slice(Math.max(0, histLen - 5));
      const isInLast5 = last5.find(y => y._key == proposedNextCard._key);
      if (isInLast5) {
        let appearedXCardsAgo = last5.length - last5.indexOf(isInLast5);
        //last card is "1" ago.
        //now try to move the card to 5 away,
        let succeeded = false;
        for (let i = this.myCards.length - 1; i >= 0; i--) {
          if (this.myCards[i]._key == proposedNextCard._key) {
            //future proof. maybe there are >2 cards with this key.
            appearedXCardsAgo = 0;
          } else if (appearedXCardsAgo < 5) {
            appearedXCardsAgo++;
          } else {
            //finally, we have arrived at 5 cards away.
            this.myCards.splice(i, 0, proposedNextCard);
            succeeded = true;
            break;
          }
        }
        if (!succeeded) {
          //if we failed, just put it as far away as you can.
          this.myCards.unshift(proposedNextCard);
        }
        return this.getNext(attempts + 1);
        // arr.splice(index, 0, item); will insert item into arr at the specified index (deleting 0 items first, that is, it's just an insert).
      } else {
        //doesn't occur in last 5 seen:
        return proposedNextCard;
      }
    } else {
      //no more cards in deck! Save progress!
      this.saveProgress();
      return null;
    }
  }
  getNextRandomized(): FlashCard {
    const l = this.myCards.length;
    let next: FlashCard;
    // if (l < 1) {
    //   this.flashCards = user.toFlashCards();
    // }
    // if (l > 0) {
    const i = Math.floor(Math.random() * l);
    next = this.myCards[i];
    this.myCards.splice(i, 1);
    return next;
  }
  saveProgress() {
    if (!this.selectedCollection) {
      console.log("cannot save progess without a collection selected");
      return;
    }
    this.saveStatusText = "saving...";
    this.myGlobal
      .saveCollection(this.selectedCollection)
      .then((v: any) => {
        this.$bvToast.toast(`Successfully Saved Status to cloud`, {
          title: "Success",
          variant: "success",
          autoHideDelay: 4000
        });
        this.saveStatusText = "Save Status to Cloud";
      })
      .catch((e: any) => {
        this.$bvToast.toast(e, {
          title: "Failure",
          variant: "danger",
          autoHideDelay: 4000
        });
      });
  }
}
</script>

<style scoped lang="scss">
.options {
  display: flex;
}
.flex-row {
  display: flex;
  align-content: center;
  align-items: stretch;
  justify-content: center;
  height: 100%;
  // width: 70vw;
}
.flex-column {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  align-items: stretch;
  justify-content: center;
  // height: 70vh;
  // width: 70vw;
}
.only-child {
  flex-grow: 1;
  height: 100%;
  width: 100%;
}
</style>
