<template>
  <div class="container mx-auto">
    Sort By
    <b-dropdown prepend="Sort By" :text="selection" variant="info">
      <b-dropdown-item @click="sortByHardest">hardest</b-dropdown-item>

      <b-dropdown-item>Action B</b-dropdown-item>
    </b-dropdown>
    ({{myCards.length}})
    <div class="j" v-if="selection == 'hardest'">
      <b-card
        class="mb-1"
        v-for="item in myCards"
        :key="item.key + item.entryValue.value"
        :header="item.key"
        :footer="'Success Rate:' + (item.successRate)"
      >
        <b-card-text>{{ item.value }}</b-card-text>
        Views: {{item.corrects.length + item.incorrects.length}}
        <!-- Everything: {{JSON.stringify(item)}} -->
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
import user, { FlashCard, EntryValue, EnteriesMap } from "@/User";

const SORTOPTIONS = ["Hardest"];
@Component({
  components: {
    SpanishText
  }
})
export default class CardStats extends Vue {
  // public raw: EnteriesMap | null = user.data;
  public selection: string = "Sort By";
  public myCards: FlashCard[] = [];
  mounted() {
    (window as any).stats = this;
  }
  sortByHardest(): FlashCard[] {
    if (this.myCards.length < 1) this.myCards = [...user.flashCards];
    console.log("# flashcard:", this.myCards.length);

    this.selection = "hardest";
    return this.myCards.sort(
      (a: FlashCard, b: FlashCard) => a.successRate - b.successRate
    );
  }
  setFlashCards() {}
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
