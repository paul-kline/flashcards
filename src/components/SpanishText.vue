<template>
  <div>
    <b-form-input
      @keydown.alt.prevent
      @keyup.alt="pushed"
      @input="emit"
      v-model="txt"
      :placeholder="placeholder"
      @keypress.enter="enterPressed"
      :state="state"
      ref="myField"
    ></b-form-input>
    <b-form-invalid-feedback id="input-live-feedback">{{errorMessage}}</b-form-invalid-feedback>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class SpanishText extends Vue {
  @Prop() private placeholder!: string;
  @Prop() private state!: boolean;
  @Prop() private value!: string;
  @Prop() private errorMessage!: string;
  public txt: string = "";
  @Watch("value")
  onPropertyChanged(value: string, oldValue: string) {
    this.txt = value;
    // console.log("detected change:", this.value);
  }

  mounted() {
    console.log(
      "mounted",
      "value",
      this.value,
      "txt",
      this.txt,
      "placeholder",
      this.placeholder
    );
    if (this.value) {
      this.txt = this.value;
    }
    if (this.placeholder) {
      console.log("should have placeholder of", this.placeholder);
      (this.$refs["myField"] as any).$forceUpdate();
    }
    //  if()
  }

  setFocus() {
    (this.$refs["myField"] as HTMLInputElement).focus();
  }
  enterPressed(x: KeyboardEvent) {
    console.log("emitting enter pressed");
    this.$emit("keypress.enter", x);
  }
  pushed(x: KeyboardEvent) {
    // console.log("pushed");
    const k = x.key;
    const i: number = "aeiouAEIOU".indexOf(k);
    if (i > -1) {
      this.insertAtCursor("áéíóúÁÉÍÓÚ"[i]);
      this.emit();
    }
  }
  emit(x: string = "") {
    if (x.indexOf("?") > -1) {
      this.$emit("question-mark");
    }
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
