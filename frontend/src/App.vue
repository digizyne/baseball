<template>
  <UApp>
    <UHeader>
      <template #left>
        <h1 class="text-3xl text-center">Baseball Players</h1>
      </template>
      <template #right>
        <UFieldGroup>
          <UButton
            label="Hits"
            :variant="sort === 'hits' ? 'solid' : 'outline'"
            size="xl"
            @click="sort = 'hits'"
          />
          <UButton
            label="Home Runs"
            :variant="sort === 'home_runs' ? 'solid' : 'outline'"
            size="xl"
            @click="sort = 'home_runs'"
          />
        </UFieldGroup>
      </template>
    </UHeader>
    <UContainer>
      <p>placeholder</p>
    </UContainer>
  </UApp>
</template>

<script setup>
import { ref } from "vue";

const sort = ref("hits");
</script>
