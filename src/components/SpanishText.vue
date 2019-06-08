<template>
  <div>
    <b-form-input
      @keydown.alt.prevent
      @keyup.alt="pushed"
      @input="emit"
      v-model="txt"
      :placeholder="placeholder"
      ref="myField"
    ></b-form-input>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
  @Prop() private placeholder!: string;
  @Prop() private value!: number;
  public txt: string = "";
  pushed(x: KeyboardEvent) {
    // console.log("pushed");
    const k = x.key;
    const i: number = "aeiouAEIOU".indexOf(k);
    if (i > -1) {
      this.insertAtCursor("áéíóúÁÉÍÓÚ"[i]);
      this.emit();
    }
  }
  emit() {
    // console.log("emitting", this.txt);
    this.$emit("input", this.txt);
  }
  insertAtCursor(myValue: string) {
    const myField = this.$refs["myField"] as HTMLInputElement;
    if (myField.selectionStart || myField.selectionStart == 0) {
      const startPos = myField.selectionStart;
      const endPos = myField.selectionEnd || 0;
      this.txt =
        this.txt.substring(0, startPos) +
        myValue +
        this.txt.substring(endPos, myField.value.length);
    } else {
      this.txt += myValue;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
