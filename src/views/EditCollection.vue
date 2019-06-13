<template>
  <div class="container mx-auto m-3">
    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="Enter New Category Name"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          :state="collectionNameState"
          label="Collection Name"
          label-for="name-input"
          invalid-feedback="Name is required"
        >
          <b-form-input
            id="name-input"
            v-model="newCollectionName"
            :state="collectionNameState"
            required
          ></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
    <b-form-select
      v-if="collectionNames && collectionNames.length > 0"
      v-model="selectedCollection"
      :options="collectionNames"
      class="mb-3"
      @input="collectionSelected"
    >
      <template slot="first">
        <option :value="null" disabled>-- Select a Collection --</option>
      </template>
      <!-- <option value="newCollection">-- New Collection --</option> -->
      <option value="newCollection">-- New Collection --</option>
    </b-form-select>
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
          :disabled="!selectedCollection"
        ></SpanishText>
      </div>
      <div class="value m-1">
        <SpanishText
          :disabled="!selectedCollection"
          @keypress.enter="submit"
          placeholder="value"
          v-model="value"
        ></SpanishText>
      </div>
    </div>
    <div v-on:keyup.enter="submit">
      <b-form-checkbox
        :disabled="!selectedCollection"
        id="checkbox-1"
        v-model="includeReverse"
        name="checkbox-1"
        :value="true"
      >Include reverse</b-form-checkbox>
    </div>
    <button type="button" @click="submit" class="btn btn-primary">Submit</button>
    <div class="mt-5">
      <button type="button" @click="saveToCloud" class="btn btn-primary">{{cloudButtonText}}</button>
    </div>
    <div>
      <div class="mt-1" v-for="(add) in toAdds" :key="add.originalKey">
        <!-- <div class="flex-row rounded-lg border-bottom p-1">
          <SpanishText :placeholder="add.originalKey" v-model="add.key"/>
          <SpanishText :placeholder="add.originalValue" v-model="add.value"/>
          <b-form-checkbox
            class="m-1"
            id="checkbox-1"
            v-model="add.reverse"
            name="checkbox-1"
            :value="true"
          >Include reverse</b-form-checkbox>
          <b-button @click="deleteMe(add)">X</b-button>
        </div>-->
        <template>
          <EntryEditor :to-add="add" @deleted="deleteMe"></EntryEditor>
          <div class="divider"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
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
export default class AddVocab extends Vue {
  public key: string = "";
  public value: string = "";
  public toAdds: ToAdd[] = [];
  public toDelete: ToAdd[] = [];
  public keyErrorMessage: string = "";
  public selectedCollection: string | null = null;
  public myGlobal = global;
  public newCollectionName: string = "";
  public collectionNameState: boolean = true;
  public currentEntries: EntriesMap | null = null;
  resetModal() {
    console.log("in reset modal");
    this.newCollectionName = "";
    // this.nameState = null
  }
  handleOk(bvModalEvt: any) {
    console.log("handling ok");
    // Prevent modal from closing
    // bvModalEvt.preventDefault();
    // Trigger submit handler
    this.handleSubmit();
  }
  handleSubmit() {
    console.log("handle submit called");
    const r = this.newCollectionName.trim();
    if (r) {
      this.myGlobal.collectionNames.push(r);
      this.selectedCollection = r;
      this.$bvModal.hide("modal-prevent-closing");
    }
  }
  get collectionNames() {
    return this.myGlobal.collectionNames;
  }
  async collectionSelected() {
    if (!this.selectedCollection) return;
    if (this.selectedCollection == "newCollection") {
      console.log("so you want to make a new collection");
      this.$bvModal.show("modal-prevent-closing");
    } else {
      this.currentEntries = await this.myGlobal.getCollection(
        this.selectedCollection
      );
      if (this.toAdds.length > 0 && this.currentEntries) {
        this.toAdds = [];
      }
      console.log("entries:", JSON.stringify(this.currentEntries));
      for (const k in this.currentEntries) {
        this.toAdds.push(this.toToAdd(this.currentEntries[k]));
      }
    }
  }
  get keyState() {
    if (!this.selectedCollection) {
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
  get reversed() {
    return this.toAdds.reverse();
  }
  test() {
    console.log("success");
  }
  mounted() {
    console.log("refefije", this.$refs["fst"]);
    (this.$refs["fst"] as SpanishText).setFocus();
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
  async submit() {
    const newItem: ToAdd = {
      originalKey: this.key,
      originalValue: this.value,
      key: this.key,
      value: this.value,
      reverse: this.includeReverse,
      collection: this.selectedCollection || ""
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
    if (!this.selectedCollection) {
      throw new Error("No current collection selected");
    }
    const x: EntriesMap = await global.getCollection(this.selectedCollection);
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
    if (!this.selectedCollection) return;
    this.toAdds.forEach(this.modifyEntry);
    const b = this.toDelete && this.toDelete.length > 0;
    let a;
    if (b) {
      a = global.saveAndDeleteCollection(
        this.selectedCollection,
        this.toDelete.map(x => x.key)
      );
    } else {
      a = global.saveCollection(this.selectedCollection);
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
  suggestMerges() {
    if (!this.currentEntries) {
      console.error("No Entries to evaluate for merge!");
      return;
    }
    const entries = this.currentEntries;
    let myCopy = [...this.toAdds];
    const suggestions = [];
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
          (k1.includes(y) ||
            k1.includes(z) ||
            k2.includes(y) ||
            k2.includes(z) ||
            y.includes(k1) ||
            y.includes(k2) ||
            z.includes(k1) ||
            z.includes(k2)) &&
          x != toAdd
        );
      });
      if (matches && matches.length > 0) {
        suggestions.push([toAdd, ...matches]);
      }
      //only keep ones not put in group.
      myCopy = myCopy.filter(x => !matches.includes(x));
    }
    console.log("suggested merges:");
    console.log(suggestions.map(x => x.map(y => [y.key, y.value])));
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
