<template>
  <div class="container mx-auto m-3">
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
        ></SpanishText>
      </div>
      <div class="value m-1">
        <SpanishText @keypress.enter="submit" placeholder="value" v-model="value"></SpanishText>
      </div>
    </div>
    <div v-on:keyup.enter="submit">
      <b-form-checkbox
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
      <div class="mt-1" v-for="(add,index) in toAdds" :key="add.originalKey + index">
        <div class="flex-row rounded-lg border-bottom p-1">
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
        </div>
        <!-- <b-dropdown-divider></b-dropdown-divider> -->
        <div class="divider"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
import user, { emptyStats, EntryValue } from "@/User";

interface ToAdd {
  originalKey: string;
  originalValue: string;
  key: string;
  value: string;
  reverse: boolean;
}

@Component({
  components: {
    SpanishText
  }
})
export default class AddVocab extends Vue {
  public key: string = "";
  public value: string = "";
  public toAdds: ToAdd[] = [];
  public keyErrorMessage: string = "";
  get keyState() {
    if (this.key.length < 1) {
      this.keyErrorMessage = "Must enter something";
      return false;
    } else {
      const res = user.data[this.key];
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
  deleteMe(x: ToAdd) {
    const i = this.toAdds.indexOf(x);
    if (i >= 0) {
      this.toAdds.splice(i, 1);
    }
    delete user.data[x.originalKey];
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
  }

  submit() {
    const newItem: ToAdd = {
      originalKey: this.key,
      originalValue: this.value,
      key: this.key,
      value: this.value,
      reverse: this.includeReverse
    };
    console.log("submitting!!!!!", newItem);

    this.toAdds.unshift(newItem);
    user.data[this.key] = {
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

  async saveToCloud() {
    this.cloudButtonText = "saving...";
    this.toAdds.forEach(modifyEntry);
    user
      .setData(user.data)
      .then(v => {
        this.$bvToast.toast(`Successfully Saved data to cloud`, {
          title: "Success",
          variant: "success",
          autoHideDelay: 4000
        });
        this.toAdds = [];
        this.cloudButtonText = "Save to Cloud";
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
function modifyEntry(x: ToAdd) {
  const entry: EntryValue = user.data[x.originalKey];
  if (x.originalKey != x.key) {
    delete user.data[x.originalKey];
  }
  entry.value = x.value;
  entry.reverse = x.reverse;
  user.data[x.key] = entry;
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
