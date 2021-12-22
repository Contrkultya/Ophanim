<template>
  <div class="hello">
    <form action="">
      <label style="margin-right: 5px;" for="vkId">вк ID</label><input type="text"
                                        id="vkId"
                                                                       style="width: 250px;"
                                        class="form-control"
                                        width="200px"
                                        v-model="vkId"/><br>
      <button style="margin-top: 5px;" @click.prevent="parseVk"  >Submit!
      </button>
    </form>
    <br>
    {{responce}}
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return  {
      vkId: '',
      parseId: '',
      responce: {}
    }
  },
  methods:  {
    parseVk() {
      console.log(this.vkId);
      axios.post("http://localhost:8081/api/parse", {vk_id : this.vkId})
              .then((response) => {
                this.parseId = response.data.parse_id;
                axios.post("http://localhost:8081/api/analyze", {parse_id : this.parseId})
                        .then(() => {
                          axios.post("http://localhost:8081/api/allResults", {parse_id : this.parseId})
                                  .then((response) => {
                                      this.result = response.data.result;
                                  })
                        })
              })
              .catch(function (error) {
                console.log(error);
              });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
