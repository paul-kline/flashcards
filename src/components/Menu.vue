<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Vocab 0.0.1</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item>
            <router-link class to="practicevocab">Practice Vocab</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="addvocab">Add Vocab</router-link>
          </b-nav-item>
          <b-nav-item>
            <router-link to="stats">Stats</router-link>
          </b-nav-item>
          <!-- <b-nav-item href="#" disabled>Disabled</b-nav-item> -->
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <!-- <b-nav-form>
            <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
            <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
          </b-nav-form>-->

          <!-- <b-nav-item-dropdown text="Lang" right>
            <b-dropdown-item href="#">EN</b-dropdown-item>
            <b-dropdown-item href="#">ES</b-dropdown-item>
            <b-dropdown-item href="#">RU</b-dropdown-item>
            <b-dropdown-item href="#">FA</b-dropdown-item>
          </b-nav-item-dropdown>-->

          <b-nav-item-dropdown right>
            <!-- Using 'button-content' slot -->
            <template slot="button-content">
              <em>User</em>
            </template>
            <template v-if="user && user.isSignedIn()">
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item @click="user.signOut()">Sign Out</b-dropdown-item>
            </template>
            <template v-else>
              <b-dropdown-item @click="user.signIn()">Sign In</b-dropdown-item>
            </template>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "@/User";

@Component
export default class Menu extends Vue {
  @Prop() private placeholder!: string;
  @Prop() private value!: number;
  private user = User;
  public txt: string = "";
  pushed(x: KeyboardEvent) {
    console.log("pushed");
    const k = x.key;
    const i: number = "aeiouAEIOU".indexOf(k);
    if (i > -1) {
      this.insertAtCursor("áéíóúÁÉÍÓÚ"[i]);
      this.emit();
    }
  }
  emit() {
    console.log("emitting", this.txt);
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
