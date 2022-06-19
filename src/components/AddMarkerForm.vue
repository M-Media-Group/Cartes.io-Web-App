<template>
  <form method="POST"
    action="/markers"
    @submit.prevent="addMarker(mapId, submitData)"
    :disabled="!canSubmit">

    <slot name="form-top"></slot>

    <div class="form-errors"
      v-if="hasErrors">
      <ul>
        <template v-for="error in formErrors">
          <li v-if="error !== ''">{{ error }}</li>
        </template>
      </ul>
    </div>
    <!-- <Multiselect v-model="submitData.category_name" valueProp="name" label="name" :searchable="true"
      :options="categories">
    </Multiselect> -->

    <label>Marker label:</label>
    <Multiselect v-model="submitData.category_name"
      valueProp="name"
      ref="multiselect"
      label="name"
      placeholder="Start typing..."
      tag-placeholder="Add this as new label"
      :options="async (query: string) => {
        return await getCategories(query)
      }"
      @open="(select$: any) => {
        if (select$.noOptions) {
          select$.resolveOptions()
        }
      }"
      :delay="250"
      :resolve-on-load="false"
      :searchable="true"
      :allow-empty="false"
      :create-option="true"
      :on-create="addTag"
      :show-labels="false"
      class="your_custom_class"
      :loading="isLoading"
      :internal-search="false"
      :clear-on-select="false"
      :options-limit="300"
      :min-chars="minCategoryNameLength"
      :max-height="600"
      :show-no-results="false"
      :preserve-search="true"
      :infinite="true"
      :limit="12"
      :attrs="{
        'minlength': minCategoryNameLength,
      }"
      required>
      <!-- <template slot="limit">Keep typing to refine your search</template>
      <template slot="noOptions">Search for or add a new label</template>
      <template slot="singleLabel" slot-scope="{ option }"><strong>{{ option.name }}</strong></template>
      <template slot="option" slot-scope="props"><img v-if="props.option.icon" class="rounded img-thumbnail mr-1"
          height="25" width="25" :src="props.option.icon" alt="" style="position: initial" />{{ props.option.name }}
      </template> -->
    </Multiselect>
    <textarea class="form-control mt-1"
      id="description"
      rows="2"
      name="description"
      v-model="submitData.description"
      placeholder="Description (optional)"></textarea>

    <input v-if="showLinkInput === 'required' || showLinkInput === 'optional'"
      class="form-control mt-1"
      type="url"
      pattern="https://.*"
      :placeholder="
        'Link using https://' +
        (showLinkInput === 'optional' ? ' (optional)' : '')
      "
      :required="showLinkInput === 'required'"
      v-model="submitData.link" />

    <!-- Expandable details with more options -->
    <details v-if="allowLatLngElevationOverride">
      <summary>More options</summary>
      <div>
        <label>Lat:</label>
        <input type="number"
          step="0.00000000000001"
          min="-90"
          max="90"
          name="lat"
          v-model="submitData.lat"
          placeholder="Latitude"
          required>

        <label>Lng:</label>
        <input type="number"
          step="0.00000000000001"
          min="-180"
          max="180"
          name="lng"
          v-model="submitData.lng"
          placeholder="Longitude"
          required>

        <label>Elevation (if blank, auto-inferred):</label>
        <input type="number"
          step="0.1"
          min="-10000"
          max="10000"
          name="elevation"
          v-model="submitData.elevation"
          placeholder="Elevation (optional)">

      </div>
    </details>


    <button type="submit"
      class="btn btn-primary btn-sm my-1"
      :disabled="!canSubmit">
      Add {{ submitData.category_name ?? "marker" }}
    </button>
  </form>
</template>
<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { computed, onMounted, PropType, reactive, ref, watch } from "vue";
import Multiselect from '@vueform/multiselect'
import { MarkerForm } from "@/types/marker";
import { Category } from "@/types/category";
import { useMarker } from "@/composables/marker";
import userDevice from "@/classes/userDevice";

const props = defineProps({
  showLinkInput: {
    type: String as PropType<"required" | "optional" | "disabled" | null>,
    default: "optional",
  },
  mapId: {
    type: String as PropType<string | number>,
    required: true,
  },
  markerLat: {
    type: Number as PropType<number | string>,
    default: "",
    required: false,
  },
  markerLng: {
    type: Number as PropType<number | string>,
    default: "",
    required: false,
  },
  markerElevation: {
    type: Number as PropType<number | string | null>,
    default: null,
    required: false,
  },
  allowLatLngElevationOverride: {
    type: Boolean as PropType<boolean>,
    default: false,
    required: false,
  },
})

const { addMarker, isLoading, formErrors, hasErrors, validateMarkerForm, minCategoryNameLength } = useMarker();

const multiselect = ref<HTMLInputElement | null>(null);

const submitData = reactive<MarkerForm>({
  lat: "",
  lng: "",
  category_name: "",
  description: "",
  link: "",
  elevation: null,
});

const canSubmit = computed(() => {
  return !isLoading.value &&
    (submitData.category_name && validateMarkerForm(submitData)) &&
    (props.showLinkInput === 'optional' || props.showLinkInput === 'disabled' || submitData.link)
});

watch(submitData, (newValue, oldValue) => {

  // Clear all the formErrors
  Object.keys(formErrors).forEach((key) => {
    // @ts-ignore
    formErrors[key] = "";
  });

  // Actually cant do below with current setup - see https://stackoverflow.com/a/68463834/7410951
  // // For each newValue key, check if it is different from oldValue key and if it is, clear the error
  // Object.keys(newValue).forEach(key => {
  //   console.log(key, newValue[key], oldValue[key], formErrors[key], newValue, oldValue);
  //   if (newValue[key] !== oldValue[key]) {
  //     // If the key exists in the formErrors object, clear it
  //     formErrors[key] = "";
  //   }
  // });
}
);

watch(
  () => props.markerLat,
  (newValue) => {
    submitData.lat = newValue.toString();
    formErrors.lat = "";
  },
  { immediate: true }
);

watch(
  () => props.markerLng,
  (newValue) => {
    submitData.lng = newValue.toString();
    formErrors.lng = "";
  },
  { immediate: true }
);

watch(
  () => props.markerElevation,
  (newValue) => {
    submitData.elevation = newValue?.toString() ?? null;
    formErrors.elevation = "";
  },
  { immediate: true }
);

const getCategories = async (query = null as string | null) => {
  if (!userDevice.isOnline) {
    alert("You must be online to fetch categories.");
    return [];
  }
  isLoading.value = true;
  let url = "https://cartes.io/api/categories"
  if (query && query.length >= minCategoryNameLength) {
    url += "?query=" + query;
  }
  const response = await fetch(url);
  const data = await response.json() as Category[];
  isLoading.value = false;
  return data;
}

const addTag = async (newTag: { name: string; }) => {
  if (newTag.name.length < minCategoryNameLength) {
    formErrors.category_name = "Category name must be at least " + minCategoryNameLength + " characters long";
    return false;
  }
  const tag = {
    id: -1,
    name: newTag.name,
    icon: "/images/marker-01.svg",
    slug: newTag.name.toLowerCase().replace(/\s+/g, "-"),
  };
  submitData.category_name = tag.name;

  //  it should return an object that contains at least the keys defined by valueProp, label & trackBy options.
  return tag
}

const focusMultiselect = () => {
  if (multiselect.value) {
    multiselect.value.focus();
  }
}

defineExpose({
  focusMultiselect,
});

</script>
<style src="@vueform/multiselect/themes/default.css">
</style>
<style>
form {
  display: grid;
  gap: 1rem;
  min-width: 300px;
}

input,
textarea,
form>button {
  /* Reset the inputs */
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-size: 16px;
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 8px;
  min-width: 200px;
}
</style>
