<template>
  <div class="container mx-auto">
    Practice, bitch ({{myCards.length}})
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
        <b-card v-else class="only-child center text-center" :header="currentCard.value">
          <div style="display:flex; flex-direction:column; justify-content:flex-end;">
            <div class="flex-row">
              <b-button
                style="width: 45%; height:60%;"
                variant="danger"
                class="btn m-1"
                @click="missed"
              >Missed it</b-button>
              <b-button
                style="width: 45%; height:60%;"
                variant="success"
                class="btn m-1"
                @click="got"
              >Got it</b-button>
            </div>
          </div>
        </b-card>
      </div>
    </div>
    <b-button
      style="width: 45%; height:60%; text-align:left"
      class="align-left btn m-1"
      @click="missed"
    >Undo</b-button>
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
  public myCards: FlashCard[] = [];
  public currentCard: FlashCard | null = null;
  public front: boolean = true;
  public saveStatusText: string = "Save Status Online";
  begin() {
    console.log("starting");
    if (this.myCards.length < 1) this.myCards = [...user.flashCards];
    this.currentCard = this.getNext();
    console.log("current card:", this.currentCard);
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
    this.currentCard = this.getNext();
    this.front = true;
    this.saveStatusText = "Save Status to Cloud (Unsaved changes)";
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
    this.myCards.sort(
      (a: FlashCard, b: FlashCard) => a.importance - b.importance
    );
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
  height: 70vh;
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
