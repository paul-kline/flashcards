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
      <b-form-select v-model="selected" :options="options" class="mb-3" @input="applySort">
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
import { Component, Vue, Watch, Prop } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
// import user from "@/ts/User";
import FlashCard from "@/ts/FlashCard";
import global from "@/ts/Global";
import { FlashCardsMap } from "../ts/Types";
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
      value: { text: "rando", sortF: byRandom },
      disabled: false
    },
    {
      text: "Hardest",
      value: { text: "hard-on", sortF: bySuccessRate },
      disabled: false
    },
    {
      text: "Recommended",
      value: { text: "recommended", sortF: byRecommendation },
      disabled: false
    },
    {
      text: "Newest",
      value: { text: "Newest", sortF: byNewest },
      disabled: false
    }
  ];

  get routeCollection(): string {
    return this.$route.params.collection;
  }
  get routeMethod(): string {
    return this.$route.params.method;
  }
  set routeCollection(v: string) {
    this.$router.push("/practicevocab/" + v);
    // this.$route.params.collection = v;
  }
  get collectionNames(): string[] | null {
    return this.myGlobal.collectionNames;
  }
  @Watch("routeCollection")
  onPropertyChanged(value: any, oldValue: any) {
    console.log(
      "collection names changed",
      "form",
      oldValue,
      "new value",
      value
    );
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
      this.applySort(this.selected);
      // this.selected.func();
    }
    const hl = this.history.length;
    if (hl > 100) {
      this.history.splice(0, 100); //cap history to last 100 cards
    }
    this.currentCard = this.getNext();
    console.log("current card:", this.currentCard);
  }
  async collectionSelected(collectionName: string) {
    // const collection = await this.myGlobal.getCollection(x);
    this.routeCollection = collectionName;
    this.allCards = await this.myGlobal.getFlashCards(collectionName);
    // this.myCards = FlashCard.toFlashCards(collection);
    // console.table(this.myCards.map(x => [x._key, x.key, x.value, x.forwards]));
  }
  applySort(selection: any) {
    this.myCards = this.allCards.sort(selection.sortF);
    console.log("sort applied:");
    tableCards(this.allCards);
    // console.table(this.allCards);
    this.postSortHook();
  }
  /**
   * limit size, randomize order.
   */
  postSortHook() {
    const start = Math.max(this.allCards.length - this.maxCards, 0);
    this.myCards = this.allCards.slice(start);

    this.myCards.sort(byRandom);
  }

  // byRecommendation() {
  //   this.allCards.sort(
  //     (a: FlashCard, b: FlashCard) => a.recommended - b.recommended
  //   );
  //   console.table(this.allCards.map(x => [x.key, x.value, x.recommended]));
  //   const start = Math.max(this.allCards.length - this.maxCards, 0);
  //   this.myCards = this.allCards.slice(start);
  // }
  // byHardest() {
  //   console.log("sorting by hardest");
  //   this.allCards.sort(
  //     (a: FlashCard, b: FlashCard) => b.successRate - a.successRate
  //   );
  //   this.myCards = this.allCards.slice(0, this.maxCards);
  // }
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
    console.log("mounted");
    console.log("routeParam", this.routeCollection);
    if (this.routeCollection) {
      //set collection?
      this.selectedCollection = this.routeCollection;
    }
    if (this.routeMethod) {
      console.log("this.routeMethod", this.routeMethod);
      //set collection?
      const me = this;
      setTimeout(() => {
        me.selected =
          me.options.find(
            x => x.text.toLowerCase() == me.routeMethod.toLowerCase()
          ) || null;
        console.log("this.SELECTED:", this.selected);
        me.$forceUpdate();
      }, 1000);
    }
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

  saveProgress() {
    if (!this.selectedCollection) {
      console.log("cannot save progess without a collection selected");
      return;
    }
    this.saveStatusText = "saving...";
    this.myGlobal
      .saveCollection(this.selectedCollection)
      .then((v: any) => {
        this.$bvToast.toast(`Successfully Saved Status to cloud: ${v}`, {
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
        this.saveStatusText = "Save Status to Cloud (unsaved)";
      });
  }
}

//sorters: should make highest priority cards LAST.
function byRandom(a: any, b: any) {
  return Math.random() - 0.5;
}
function byNewest(a: FlashCard, b: FlashCard) {
  return a.createdTime - b.createdTime;
}
//want lowest success rate last.
function bySuccessRate(a: FlashCard, b: FlashCard) {
  return b.successRate - a.successRate;
}
//want highest value last.
function byRecommendation(a: FlashCard, b: FlashCard) {
  return a.recommended - b.recommended;
}

function tableCards(ls: FlashCard[]) {
  console.table(
    ls.map(x => {
      return {
        key: x.key,
        value: x.value,
        success: x.successRate,
        rec: x.recommended
      };
    })
  );
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
