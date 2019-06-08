<template>
  <div class="container mx-auto m-3">
    <div class="flex-row">
      <div class="key m-1">
        <SpanishText placeholder="key" v-model="key"></SpanishText>
      </div>
      <div class="value m-1">
        <SpanishText placeholder="value" v-model="value"></SpanishText>
      </div>
    </div>
    <b-form-checkbox
      id="checkbox-1"
      v-model="includeReverse"
      name="checkbox-1"
      :value="true"
      :unchecked-value="false"
    >Include reverse</b-form-checkbox>
    <button type="button" @click="submit" class="btn btn-primary">Submit</button>
    <div class="mt-5">
      <button type="button" @click="saveToCloud" class="btn btn-primary">Save to Cloud</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SpanishText from "@/components/SpanishText.vue"; // @ is an alias to /src
import user, { emptyStats } from "@/User";

@Component({
  components: {
    SpanishText
  }
})
export default class AddVocab extends Vue {
  public key: string = "";
  public value: string = "";
  public includeReverse: boolean = true;
  submit() {
    user.data[this.key] = {
      value: this.value,
      reverse: this.includeReverse,
      created: new Date(),
      stats: emptyStats()
    };
    console.log("submitted", this.key, this.value, this.includeReverse);
  }

  saveToCloud() {
    user.setData(user.data);
  }
}
</script>

<style scoped lang="scss">
.flex-row {
  display: flex;
  align-content: center;
  justify-content: center;
}
</style>
