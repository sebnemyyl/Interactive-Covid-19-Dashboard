<template>
  <div class="container">
    <div class="message">{{ message }}</div>
    <select @change="onChange" :value="initial">
      <option v-for="col in columns" :key="col" :value="col">{{ col }}</option>
    </select>
  </div>
</template>
<script>
export default {
  props: {
    initial: String,
    columns: Array,
    message: String,
  },
  methods: {
    onChange(e) {
      this.$emit("selected", e.target.value);
    },
  },
};
</script>
<style scoped>
.message {
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
}
.container {
  display: inline-block;
  margin: 0.5rem 1rem;
}
select {
  padding: 0.5rem;
}
</style>
