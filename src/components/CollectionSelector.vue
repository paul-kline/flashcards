<template>
  <div class="container mx-auto m-3">
    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      title="Enter New Category Name"
      @show="handleShow"
      @hidden="handleHidden"
      @ok="handleOk"
      @cancel="handleCancel"
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
    <div class="else" v-else>Please wait...</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import global from "@/ts/Global";

@Component({
  components: {}
})
export default class AddVocab extends Vue {
  public selectedCollection: string | null = null;
  public myGlobal = global;
  public newCollectionName: string = "";
  public collectionNameState: boolean = true;
  public previousSelection: string | null = null;
  resetModal() {
    console.log("in reset modal");
    this.newCollectionName = "";
    // this.nameState = null
  }
  handleShow(something: any) {
    console.log("handle show. selected collection:", this.selectedCollection);
    this.resetModal();
  }
  handleHidden(something: any) {
    console.log("handleHidden");
    this.handleCancel(something);
    this.resetModal();
  }
  handleOk(bvModalEvt: any) {
    console.log("handling ok");
    // Prevent modal from closing
    // bvModalEvt.preventDefault();
    // Trigger submit handler
    this.handleSubmit();
  }
  handleCancel(something: any) {
    console.log("setting selected to: ", this.previousSelection);

    this.selectedCollection = this.previousSelection;
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
      this.previousSelection = this.selectedCollection;
      console.log("emitting: 'selected' ", this.selectedCollection);
      this.$emit("selected", this.selectedCollection);
    }
  }

  mounted() {}
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
