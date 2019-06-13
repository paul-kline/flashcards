<template>
  <div class="flex-row rounded-lg border-bottom p-1">
    <SpanishText :placeholder="toAdd.originalKey" v-model="toAdd.key"/>
    <SpanishText :placeholder="toAdd.originalValue" v-model="toAdd.value"/>
    <b-form-checkbox
      class="m-1"
      id="checkbox-1"
      v-model="toAdd.reverse"
      name="checkbox-1"
      :value="true"
    >Include reverse</b-form-checkbox>
    <b-button @click="deleteMe">X</b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ToAdd } from "@/ts/Types";
import SpanishText from "@/components/SpanishText.vue";
@Component({
  components: {
    SpanishText
  }
})
export default class EntryEditor extends Vue {
  @Prop() private toAdd!: ToAdd;
  @Prop() public prop2!: string;

  @Watch("toAdd")
  onPropertyChanged(value: string, oldValue: string) {
    console.log("toadd changed from:", oldValue, "to", value);
  }

  mounted() {
    // console.log("mounted with:", this.toAdd);
    // console.log("prop2", this.prop2);
  }
  deleteMe() {
    console.log("emitting delete:", this.toAdd);
    this.$emit("deleted", this.toAdd);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
