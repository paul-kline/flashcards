<template>
  <div class="container mx-auto">
    <b-form-select
      v-if="collectionNames && collectionNames.length > 0"
      v-model="collectionSelection"
      :options="collectionNames"
      class="mb-3"
      @input="collectionSelected"
    >
      <template slot="first">
        <option :value="null" disabled>-- Select a Collection --</option>
      </template>
    </b-form-select>Sort By
    <b-dropdown prepend="Sort By" :text="selection" variant="info">
      <b-dropdown-item @click="sortByHardest">hardest</b-dropdown-item>

      <b-dropdown-item>Action B</b-dropdown-item>
    </b-dropdown>
    ({{myCards.length}})
    <div class="j" v-if="selection == 'hardest'">
      <b-card
        class="mb-1"
        v-for="item in myCards"
        :key="item.key + item.value"
        :footer="'Success Rate:' + (item.successRate)"
      >
        <h6 slot="header" class="mb-0">
          <strong>{{item.key}} ==></strong>
          <em>{{item.value}}</em>
        </h6>
        <!-- <b-card-header > -->

        <!-- </b-card-header> -->
        <!-- <b-card-text>{{ item.value }}</b-card-text> -->
        Views: {{item.corrects.length + item.incorrects.length}}
        <!-- Everything: {{JSON.stringify(item)}} -->
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
import global from "@/ts/Global";
import { EntryValue, EntriesMap } from "@/ts/Types";
import FlashCard from "@/ts/FlashCard";
const SORTOPTIONS = ["Hardest"];
@Component({
  components: {
    SpanishText
  }
})
export default class CardStats extends Vue {
  // public raw: EnteriesMap | null = user.data;
  public selection: string = "Sort By";
  public collectionSelection: string | null = null;
  public myGlobal = global;
  public myCards: FlashCard[] = [];
  get collectionNames(): string[] | null {
    return this.myGlobal.collectionNames;
  }
  mounted() {
    (window as any).stats = this;
  }
  async collectionSelected() {
    if (!this.collectionSelection) return;
    this.myCards = await this.myGlobal.getFlashCards(this.collectionSelection);
    console.table(this.myCards.map(x => [x.key, x.value]));
  }
  sortByHardest(): FlashCard[] {
    // if (this.myCards.length < 1) this.myCards = [...user.flashCards];
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
