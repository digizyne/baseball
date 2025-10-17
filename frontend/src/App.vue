<template>
  <UApp :toaster="{ position: 'bottom-right', duration: 3000 }">
    <UHeader :toggle="false">
      <template #left>
        <h1 class="text-3xl text-center">Baseball Players</h1>
      </template>
      <template #right>
        <UFieldGroup>
          <UButton
            label="Hits"
            :variant="!sort_by_hrs ? 'solid' : 'outline'"
            @click="sort_by_hrs = false"
          />
          <UButton
            label="Home Runs"
            :variant="sort_by_hrs ? 'solid' : 'outline'"
            @click="sort_by_hrs = true"
          />
        </UFieldGroup>
      </template>
    </UHeader>
    <UContainer class="pt-4">
      <div
        v-if="isFetching"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        <USkeleton v-for="n in 12" :key="n" class="w-full h-60 rounded-xl" />
      </div>
      <UError
        v-else-if="error"
        :error="{ statusMessage: 'Error fetching players' }"
      >
        <template #links>
          <UButton label="Retry" @click="refetchPlayers" />
        </template>
      </UError>
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
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <p v-if="selectedPlayerDescription">{{ selectedPlayerDescription }}</p>
        <USkeleton v-else class="w-full h-50 rounded-xl" />
        <div class="grid grid-cols-2 gap-6 gap-y-4 mt-6">
          <UFormField label="Games">
            <UInputNumber v-model="selectedPlayer['Games']" />
          </UFormField>
          <UFormField label="At-bat">
            <UInputNumber v-model="selectedPlayer['At-bat']" />
          </UFormField>
          <UFormField label="Runs">
            <UInputNumber v-model="selectedPlayer['Runs']" />
          </UFormField>
          <UFormField label="Hits">
            <UInputNumber v-model="selectedPlayer['Hits']" />
          </UFormField>
          <UFormField label="Double (2B)">
            <UInputNumber v-model="selectedPlayer['Double (2B)']" />
          </UFormField>
          <UFormField label="third baseman">
            <UInputNumber v-model="selectedPlayer['third baseman']" />
          </UFormField>
          <UFormField label="home run">
            <UInputNumber v-model="selectedPlayer['home run']" />
          </UFormField>
          <UFormField label="run batted in">
            <UInputNumber v-model="selectedPlayer['run batted in']" />
          </UFormField>
          <UFormField label="a walk">
            <UInputNumber v-model="selectedPlayer['a walk']" />
          </UFormField>
          <UFormField label="Strikeouts">
            <UInputNumber v-model="selectedPlayer['Strikeouts']" />
          </UFormField>
          <UFormField label="stolen base">
            <UInputNumber v-model="selectedPlayer['stolen base']" />
          </UFormField>
          <UFormField label="Caught stealing">
            <UInputNumber v-model="selectedPlayer['Caught stealing']" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div v-if="hasChanges" class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            variant="ghost"
            @click="showPlayerDetails = false"
          />
          <UButton
            label="Save"
            variant="solid"
            color="primary"
            :loading="saveLoading"
            @click="savePlayerDetails"
          />
        </div>
      </template>
    </USlideover>
  </UApp>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useFetch } from "@vueuse/core";

const sort_by_hrs = ref(false);
const fetchUrl = computed(
  () => `http://localhost:5000/players?sort_by_hrs=${sort_by_hrs.value}`
);
const {
  isFetching,
  error,
  data: players,
  execute: refetchPlayers,
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

const hasChanges = ref(false);
watch(
  selectedPlayer,
  (newVal, oldVal) => {
    if (oldVal === null) hasChanges.value = false;
    else hasChanges.value = true;
  },
  { deep: true, immediate: false }
);

const saveLoading = ref(false);
const savePlayerDetails = async () => {
  saveLoading.value = true;
  await fetch(`http://localhost:5000/players/${selectedPlayer.value._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selectedPlayer.value),
  });
  saveLoading.value = false;
  useToast().add({
    title: "Success",
    description: `Player ${selectedPlayer.value["Player name"]} updated successfully.`,
    color: "success",
  });
};
</script>
