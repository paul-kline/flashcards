<template>
  <div>
    <b-navbar toggleable="sm" type="dark" variant="dark">
      <b-navbar-brand to="/" :active="active == -1" @click="active=-1">Vocab 0.0.7.13</b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-nav tabs>
          <b-nav-item :to="{'name' : 'practicevocab'}" :active="active==0" @click="active=0">
            Practice Vocab
            <!-- <router-link class to="practicevocab">Practice Vocab</router-link> -->
          </b-nav-item>
          <b-nav-item to="addvocab" extact :active="active==1" @click="active=1">
            Add Vocab
            <!-- <router-link to="addvocab">Add Vocab</router-link> -->
          </b-nav-item>

          <b-nav-item to="stats" :active="active==2" @click="active=2">Stats</b-nav-item>
          <b-nav-item
            :to="{'name' : 'managecollection'}"
            :active="active==3"
            @click="active=3"
          >Manage Collection</b-nav-item>
          <!-- <b-nav-item href="#" disabled>Disabled</b-nav-item> -->
        </b-nav>

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

          <b-nav-item-dropdown v-if="user && user.isSignedIn()" right>
            <!-- Using 'button-content' slot -->
            <template slot="button-content">
              <em>Logged In</em>
            </template>
            <template v-if="user && user.isSignedIn()">
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item @click="user.signOut()">Sign Out</b-dropdown-item>
            </template>
            <!-- <template v-else>
              <b-dropdown-item @click="user.signIn()">Sign In</b-dropdown-item>
            </template>-->
          </b-nav-item-dropdown>
          <b-nav-item v-else @click="user.signIn()">Sign In</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import User from "@/ts/User";

@Component
export default class Menu extends Vue {
  active = -1;
  user = User;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
