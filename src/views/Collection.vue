<template>
  <div>
    <CollectionSelector @selected="selected"/>

    <div class="title">Edit Collection</div>
    <b-tabs content-class="mt-3 container">
      <b-tab title="Edit Entries" active>
        <EditCollection :to-adds="toAdds" :collection-name="collectionName"/>
      </b-tab>
      <b-tab title="Find Duplicates">
        <FindDuplicates :to-adds="toAdds"></FindDuplicates>
      </b-tab>
      <b-tab title="Disabled" disabled>
        <p>I'm a disabled tab!</p>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
import {
  EntriesMap,
  CollectionMap,
  emptyStats,
  EntryValue,
  ToAdd
} from "@/ts/Types";
import global from "@/ts/Global";
import EditCollection from "@/views/EditCollection.vue";
import CollectionSelector from "@/components/CollectionSelector.vue";
import FindDuplicates from "@/views/FindDuplicates.vue";

@Component({
  components: {
    CollectionSelector,
    EditCollection,
    FindDuplicates
  }
})
export default class Collection extends Vue {
  public myGlobal = global;
  public currentEntries: EntriesMap | null = null;
  public toAdds: ToAdd[] = [];

  public collectionName: string = "";
  selected(collectionName: string) {
    console.log("recevied selected event:", collectionName);
    this.collectionName = collectionName;
  }

  @Watch("collectionName")
  async collectionSelected() {
    console.log("detected collectionChange event");
    this.currentEntries = await this.myGlobal.getCollection(
      this.collectionName
    );
    if (this.toAdds.length > 0 && this.currentEntries) {
      this.toAdds = [];
    }
    console.log("entries:", JSON.stringify(this.currentEntries));
    for (const k in this.currentEntries) {
      this.toAdds.push(this.toToAdd(this.currentEntries[k]));
    }
  }
  toToAdd(x: EntryValue) {
    const newItem: ToAdd = {
      originalKey: x.key,
      originalValue: x.value,
      key: x.key,
      value: x.value,
      reverse: x.reverse,
      collection: this.collectionName || ""
    };
    return newItem;
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
