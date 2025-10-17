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
            :variant="!sort_by_hrs ? 'solid' : 'outline'"
            size="xl"
            @click="sort_by_hrs = false"
          />
          <UButton
            label="Home Runs"
            :variant="sort_by_hrs ? 'solid' : 'outline'"
            size="xl"
            @click="sort_by_hrs = true"
          />
        </UFieldGroup>
      </template>
    </UHeader>
    <UContainer class="pt-4">
      <p v-if="isFetching">fetching...</p>
      <p v-else-if="error">Error fetching data</p>
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <UBlogPost
          v-for="player in players"
          :key="player._id"
          :title="player['Player name']"
          :badge="player.position"
          :image="`https://api.dicebear.com/9.x/pixel-art/svg?seed=${player['Player name']}`"
          :ui="{ image: 'object-fill bg-neutral-800' }"
          @click="selectPlayer(player)"
        >
          <template #description>
            <div class="flex justify-between">
              <div>
                Hits: <b>{{ player["Hits"] }}</b>
              </div>
              <div>
                HRs: <b>{{ player["home run"] }}</b>
              </div>
            </div>
          </template>
        </UBlogPost>
      </div>
    </UContainer>
    <USlideover
      v-model:open="showPlayerDetails"
      :title="selectedPlayer ? selectedPlayer['Player name'] : ''"
      :description="selectedPlayer ? selectedPlayer['position'] : ''"
      @after:leave="
        selectedPlayer = null;
        selectedPlayerDescription = null;
      "
    >
      <template #body>
        <p v-if="selectedPlayerDescription">{{ selectedPlayerDescription }}</p>
        <USkeleton v-else class="w-full h-50 rounded-xl" />
      </template>
    </USlideover>
  </UApp>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFetch } from "@vueuse/core";

const sort_by_hrs = ref(false);
const fetchUrl = computed(
  () => `http://localhost:5000/players?sort_by_hrs=${sort_by_hrs.value}`
);
const {
  isFetching,
  error,
  data: players,
} = useFetch(fetchUrl, {
  refetch: true,
  afterFetch(ctx) {
    ctx.data = JSON.parse(ctx.data);
    return ctx;
  },
});

const showPlayerDetails = ref(false);
const selectedPlayer = ref(null);
const selectedPlayerDescription = ref(null);
const selectPlayer = async (player) => {
  selectedPlayer.value = player;
  showPlayerDetails.value = true;
  const res = await fetch(
    `http://localhost:5000/players/${player._id}/description`
  );
  const data = await res.json();
  selectedPlayerDescription.value = data.description;
};
</script>
