<template>
  <div>
    <div class="container mx-auto m-3">
      <b-button variant="outline-primary" @click="suggestMerges">Perform Search</b-button>
    </div>
    <div class="merges">
      <Merger
        v-for="suggestionGroup in suggestions"
        :key="suggestionGroup.reduce((acc,x) => acc + x.key,'')"
        :possible-duplicates="suggestionGroup"
      ></Merger>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
import {
  EntriesMap,
  CollectionMap,
  emptyStats,
  EntryValue,
  ToAdd
} from "@/ts/Types";
import global from "@/ts/Global";
import EntryEditor from "@/components/EntryEditor.vue";
import Merger from "@/views/Merger.vue";
@Component({
  components: {
    SpanishText,
    EntryEditor,
    Merger
  }
})
export default class FindDuplicates extends Vue {
  @Prop() private toAdds!: ToAdd[];
  public suggestions: ToAdd[][] = [];

  public key: string = "";
  public value: string = "";
  public edited: boolean = false;
  // public toAdds: ToAdd[] = [];
  public toDelete: ToAdd[] = [];
  public keyErrorMessage: string = "";
  public selectedCollection: string | null = null;
  public myGlobal = global;
  public newCollectionName: string = "";
  public collectionNameState: boolean = true;
  public currentEntries: EntriesMap | null = null;

  async deleteMe(x: ToAdd) {
    if (!this.selectedCollection) {
      console.error("could not delete", x, "because no selection");
      return;
    }
    const i = this.toAdds.indexOf(x);
    if (i >= 0) {
      const [x] = this.toAdds.splice(i, 1);
      this.toDelete.push(x);
    }
    const collection = await global.getCollection(this.selectedCollection);
    // this.toDelete.push(collection[x.originalKey]);
    delete collection[x.originalKey];
  }

  mounted() {
    (window as any).getSuggestions = this.suggestMerges;
  }
  toToAdd(x: EntryValue) {
    const newItem: ToAdd = {
      originalKey: x.key,
      originalValue: x.value,
      key: x.key,
      value: x.value,
      reverse: x.reverse,
      collection: this.selectedCollection || ""
    };
    return newItem;
  }

  suggestMerges() {
    if (!this.toAdds || this.toAdds.length < 1) {
      console.error("No Entries to evaluate for merge!");
      return;
    }
    const entries = this.currentEntries;
    let myCopy = [...this.toAdds];
    this.suggestions = [];
    while (myCopy && myCopy.length > 0) {
      const toAdd = myCopy.pop() as ToAdd; //must exist. typescript you idiot.
      const [k1, k2] = [
        toAdd.key.trim().toLowerCase(),
        toAdd.value.trim().toLowerCase()
      ];
      const matches = this.toAdds.filter((x: ToAdd) => {
        const [y, z] = [
          x.key.trim().toLowerCase(),
          x.value.trim().toLowerCase()
        ];
        return (
          ((k1.length > 0 &&
            (((k1.includes(y) || y.includes(k1)) && y.length > 0) ||
              ((k1.includes(z) || z.includes(k1)) && z.length > 0))) ||
            ((k2.length > 0 &&
              ((k2.includes(y) || y.includes(k2)) && y.length > 0)) ||
              ((k2.includes(z) || z.includes(k2)) && z.length > 0))) &&
          x != toAdd
        );
      });
      if (matches && matches.length > 0) {
        this.suggestions.push([toAdd, ...matches]);
      }
      //only keep ones not put in group.
      myCopy = myCopy.filter(x => !matches.includes(x));
    }
    console.log("suggested merges:");
    console.table(this.suggestions.map(x => x.map(y => [y.key, y.value])));
  }
}
</script>

<style scoped lang="scss">
.flex-row {
  display: flex;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
