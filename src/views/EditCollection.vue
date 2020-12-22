<template>
  <div class="container mx-auto m-3">
    <div class="add-new rounded border p-1">
      <div class>Add new</div>
      <div class="flex-row">
        <div class="key m-1">
          <SpanishText
            @question-mark="onQMark"
            ref="fst"
            placeholder="key"
            v-model="key"
            varient="danger"
            :state="keyState"
            :errorMessage="keyErrorMessage"
            :disabled="!collectionName"
          ></SpanishText>
        </div>
        <div class="value m-1">
          <SpanishText
            :disabled="!collectionName"
            @keypress.enter="submit"
            placeholder="value"
            v-model="value"
          ></SpanishText>
        </div>
      </div>
      <div v-on:keyup.enter="submit">
        <b-form-checkbox
          :disabled="!collectionName"
          id="checkbox-1"
          v-model="includeReverse"
          name="checkbox-1"
          :value="true"
        >Include reverse</b-form-checkbox>
      </div>
      <button type="button" @click="submit" class="btn btn-primary">Submit</button>
    </div>

    <div class="mt-5">
      <button
        type="button"
        @click="saveToCloud"
        class="btn btn-primary"
      >{{edited? "Save (unsaved changes)" : cloudButtonText}}</button>
    </div>
    <div class="filter">
      <SpanishText v-model="filterText" placeholder="filter"/>
    </div>
    <div>
      <div class="mt-1" v-for="(add) in filteredToAdds" :key="add.originalKey">
        <template>
          <EntryEditor :to-add="add" @deleted="deleteMe" @changed="edited=true"></EntryEditor>
          <div class="divider"></div>
        </template>
      </div>
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

@Component({
  components: {
    SpanishText,
    EntryEditor
  }
})
export default class EditCollection extends Vue {
  @Prop() private collectionName!: string;
  @Prop() private toAdds!: ToAdd[];
  public filterText: string = "";
  public key: string = "";
  public value: string = "";
  public edited: boolean = false;
  public keyErrorMessage: string = "";
  public myGlobal = global;
  public currentEntries: EntriesMap | null = null;
  public toDelete: ToAdd[] = [];

  get filteredToAdds() {
    const t = this.filterText;
    return t
      ? this.toAdds.filter(
          x =>
            x.originalKey.toLowerCase().includes(this.filterText) ||
            x.originalValue.toLowerCase().includes(this.filterText)
        )
      : this.toAdds;
  }
  // @Watch("collectionName")
  // async collectionSelected() {
  //   console.log("detected collectionChange event");
  //   this.currentEntries = await this.myGlobal.getCollection(
  //     this.collectionName
  //   );
  //   if (this.toAdds.length > 0 && this.currentEntries) {
  //     this.toAdds = [];
  //   }
  //   console.log("entries:", JSON.stringify(this.currentEntries));
  //   for (const k in this.currentEntries) {
  //     this.toAdds.push(this.toToAdd(this.currentEntries[k]));
  //   }
  // }
  get keyState() {
    if (!this.collectionName) {
      this.keyErrorMessage = "Please select a collection first.";
      return false;
    } else if (this.key.length < 1) {
      this.keyErrorMessage = "Key must be non-empty.";
      return false;
    } else {
      const res: EntryValue | null =
        this.currentEntries &&
        (this.currentEntries[this.key] ||
          this.currentEntries[this.key.trim().toLowerCase()]);
      if (res) {
        this.keyErrorMessage = "Key already exists with value: " + res.value;
        return false;
      } else {
        return true;
      }
    }
    // return this.key.length < 1 || !(this.key in user.data);
  }
  public includeReverse: boolean = true;
  private cloudButtonText: string = "Save to Cloud";
  onQMark() {
    // console.log("on q mark!!!");
    this.includeReverse = false;
  }
  async deleteMe(x: ToAdd) {
    if (!this.collectionName) {
      console.error("could not delete", x, "because no selection");
      return;
    }
    const i = this.toAdds.indexOf(x);
    if (i >= 0) {
      const [x] = this.toAdds.splice(i, 1);
      this.toDelete.push(x);
    }
    const collection = await global.getCollection(this.collectionName);
    // this.toDelete.push(collection[x.originalKey]);
    delete collection[x.originalKey];
  }
  get reversed() {
    return this.toAdds.reverse();
  }
  test() {
    console.log("success");
  }
  mounted() {
    console.log("refefije", this.$refs["fst"]);
    (this.$refs["fst"] as SpanishText).setFocus();
    // (window as any).getSuggestions = this.suggestMerges;
  }
  // toToAdd(x: EntryValue) {
  //   const newItem: ToAdd = {
  //     originalKey: x.key,
  //     originalValue: x.value,
  //     key: x.key,
  //     value: x.value,
  //     reverse: x.reverse,
  //     collection: this.collectionName || ""
  //   };
  //   return newItem;
  // }
  async submit() {
    const newItem: ToAdd = {
      originalKey: this.key,
      originalValue: this.value,
      key: this.key,
      value: this.value,
      reverse: this.includeReverse,
      collection: this.collectionName || ""
    };
    console.log("submitting!!!!!", newItem);

    this.toAdds.unshift(newItem);
    const coll = await this.getColl();
    coll[this.key] = {
      key: this.key,
      value: this.value,
      reverse: this.includeReverse,
      created: new Date(),
      stats: emptyStats()
    };
    console.log("submitted", this.key, this.value, this.includeReverse);
    this.key = "";
    this.value = "";
    this.cloudButtonText = "Submit to Cloud (unsaved changes)";
    (this.$refs["fst"] as SpanishText).setFocus();
  }
  async getColl(): Promise<EntriesMap> {
    if (!this.collectionName) {
      throw new Error("No current collection selected");
    }
    const x: EntriesMap = await global.getCollection(this.collectionName);
    return x;
  }
  async modifyEntry(x: ToAdd) {
    const col: EntriesMap = await this.getColl();
    const entry: EntryValue = col[x.originalKey];
    if (x.originalKey != x.key) {
      delete col[x.originalKey];
    }
    entry.value = x.value;
    entry.reverse = x.reverse;
    col[x.key] = entry;
  }
  async saveToCloud() {
    this.cloudButtonText = "saving...";
    console.log("toadds are:", this.toAdds);
    if (!this.collectionName) return;
    this.toAdds.forEach(this.modifyEntry);
    const b = this.toDelete && this.toDelete.length > 0;
    let a;
    if (b) {
      a = global.saveAndDeleteCollection(
        this.collectionName,
        this.toDelete.map(x => x.key)
      );
    } else {
      a = global.saveCollection(this.collectionName);
    }
    a.then(v => {
      this.$bvToast.toast(`Successfully Saved data to cloud`, {
        title: "Success",
        variant: "success",
        autoHideDelay: 4000
      });
      // this.toAdds = [];
      this.toDelete = [];
      this.cloudButtonText = "Save to Cloud";
    }).catch(e => {
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
  justify-content: center;
  flex-wrap: wrap;
}
</style>
