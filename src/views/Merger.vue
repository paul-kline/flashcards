<template>
  <b-card class="flex-row">
    <div class="possible-duplicates flex-column">
      <EntryEditor v-for="entry in possibleDuplicates" :key="entry.key" :to-add="entry"></EntryEditor>
    </div>
    <div class="vertical-divider"></div>
    <EntryEditor class="merged" :to-add="merged"></EntryEditor>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { ToAdd } from "@/ts/Types";
import SpanishText from "@/components/SpanishText.vue";
import EntryEditor from "@/components/EntryEditor.vue";
@Component({
  components: {
    SpanishText,
    EntryEditor
  }
})
export default class Merger extends Vue {
  @Prop() private possibleDuplicates!: ToAdd[];
  private merged: ToAdd;

  // @Watch("toAdd")
  // onPropertyChanged(value: string, oldValue: string) {
  //   console.log("toadd changed from:", oldValue, "to", value);
  // }
  initalSuggestion(suggestions: ToAdd[] = this.possibleDuplicates): ToAdd {
    let key = "";
    let value = "";
    suggestions.forEach((s: ToAdd) => {
      key += " / " + s.key;
      value += " / " + s.value;
    });
    const reverse = suggestions.find(x => x.reverse) ? true : false;
    const collection = suggestions[0].collection;
    return {
      originalKey: key,
      key: key,
      originalValue: value,
      value: value,
      reverse: reverse,
      collection: collection
    };
    // export interface ToAdd {
    //   originalKey: string;
    //   originalValue: string;
    //   key: string;
    //   value: string;
    //   reverse: boolean;
    //   collection: string;
    // }
  }
  mounted() {
    // console.log("mounted with:", this.toAdd);
    // console.log("prop2", this.prop2);
  }
  deleteMe() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.flex-column {
  display: flex;
  flex-direction: column;
}
.vertical-divider {
  border-right: 1px dashed #333;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
</style>
