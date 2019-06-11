<template>
  <div class="container mx-auto" style="height:70vh;">
    <div class="ordering">
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
import user, { FlashCard, EntryValue } from "@/User";

@Component({
  components: {
    SpanishText
  }
})
export default class PracticeVocab extends Vue {
  public name: string = "practicevocab";
  public myCards: FlashCard[] = [];
  public history: FlashCard[] = [];
  public currentCard: FlashCard | null = null;
  public selected: any = null;

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

  public front: boolean = true;
  public saveStatusText: string = "Save Status Online";
  begin() {
    (window as any).me = this;
    console.log("starting");
    if (this.myCards.length < 1) this.myCards = [...user.flashCards];
    const hl = this.history.length;
    if (hl > 100) {
      this.history.splice(0, 100); //cap history to last 100 cards
    }
    this.currentCard = this.getNext();
    console.log("current card:", this.currentCard);
  }
  selectionMade(x: any) {
    console.log("selection made");
    x.func();
  }
  randomize() {
    console.log("randiming");
    this.myCards.sort((a: FlashCard, b: FlashCard) => Math.random() - 0.5);
    console.log("random order", this.myCards.map(x => (x as any)._key));
  }
  byHardest() {
    console.log("sorting by hardest");
    this.myCards.sort(
      (a: FlashCard, b: FlashCard) => b.successRate - a.successRate
    );
  }
  got() {
    //user got correct
    const c = this.currentCard;
    if (c) {
      c.addSuccess();
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
  missed() {
    //user missed, idiot
    const c = this.currentCard;
    if (c) {
      c.addFailure();
    }
    this.nextTick();
  }
  mounted() {
    this.myCards = [...user.flashCards];
    // this.myCards.sort(
    //   (a: FlashCard, b: FlashCard) => a.importance - b.importance
    // );
    this.randomize();
  }
  getNext(): FlashCard | null {
    console.log("myCards", this.myCards);
    const x = this.myCards.pop();
    if (x) {
      return x;
    } else {
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
    this.saveStatusText = "saving...";
    user
      .setData()
      .then(v => {
        this.$bvToast.toast(`Successfully Saved Status to cloud`, {
          title: "Success",
          variant: "success",
          autoHideDelay: 4000
        });
        this.saveStatusText = "Save Status to Cloud";
      })
      .catch(e => {
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
