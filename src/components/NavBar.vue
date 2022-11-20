<script setup lang="ts">
import { useUser } from '@/composables/user';
import CreateMapButton from '@/components/CreateMapButton.vue';
import { useMap } from '@/composables/map';
import { Ref, ref } from 'vue';
import { Map } from '@/types/map';
import { useRouter } from 'vue-router';

const { user, isLoading } = useUser();

const { searchForMap } = useMap();

const searchResults = ref([]) as Ref<Map[]>;

const router = useRouter();

const searchIsFocused = ref(false);

const searchTimeout = ref(null as any);

const hasSearched = ref(false);

const searchInput = ref() as Ref<HTMLInputElement>;

// Set a 500ms timeout to prevent the search from running on every keystroke
const debounceSearch = (query: string) => {
    hasSearched.value = false;

    if (query.length < 3) {
        return;
    }

    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }

    searchTimeout.value = setTimeout(() => {
        search(query);
    }, 400);

};

const search = async (query: string) => {
    const results = await searchForMap(query);
    hasSearched.value = true;
    if (!results) {
        return;
    }
    searchResults.value = results.data;

    // If there is only one result, navigate to it
    if (results.data.length === 1) {
        navigateToMap(results.data[0].uuid);
    }
}

const navigateToMap = (mapId: string) => {
    router.push({
        path: '/maps/' + mapId,
    });
    hasSearched.value = false;
    searchInput.value.value = '';
    searchInput.value.blur();
}

const triggerBlur = () => {
    setTimeout(() => {
        searchIsFocused.value = false;
    }, 200);
}

</script>

<template>
    <nav class="container-fluid">
        <ul>
            <li>
                <router-link to='/'>
                    <strong>Cartes.io</strong>
                </router-link>
            </li>
            <li class="search">
                <input ref="searchInput"
                    type="search"
                    placeholder="search"
                    @focus="searchIsFocused = true"
                    @blur="triggerBlur"
                    @input="debounceSearch(($event.target as any)?.value)"
                    list="search-results"
                    :aria-invalid="hasSearched ? false : undefined" />

                <datalist id="search-results">
                    <option v-for="result in searchResults"
                        :value="result.title"
                        @click="navigateToMap(result.uuid)" />
                </datalist>

                <!-- Also show a ul -->
                <ul class="search-results"
                    v-if="searchIsFocused && searchResults.length > 0 && hasSearched">
                    <li v-for="result in searchResults"
                        :key="result.uuid"
                        @click.prevent="navigateToMap(result.uuid)">
                        <router-link :to="'/maps/' + result.uuid">
                            {{ result.title }}
                        </router-link>
                    </li>
                </ul>
            </li>
        </ul>
        <ul v-if="!searchIsFocused">
            <li role="list"
                v-if="user?.id">
                <router-link :to='`/users/${user.username}`'
                    aria-haspopup="listbox">{{ user.username }}
                </router-link>
                <ul role="listbox"
                    style="z-index:1000">
                    <li>
                        <router-link :to='`/users/${user.username}`'
                            aria-haspopup="listbox">Profile
                        </router-link>
                    </li>
                    <li>
                        <router-link :to='`/me`'
                            aria-haspopup="listbox">Settings
                        </router-link>
                    </li>
                </ul>
            </li>
            <li v-else>
                <router-link :aria-busy="isLoading"
                    :disabled="isLoading ? 'disabled' : null"
                    to='/login'>{{ isLoading ? '' : 'Login' }}
                </router-link>
            </li>
            <li>
                <create-map-button />
            </li>
        </ul>
    </nav>
</template>

<style scoped>
/* If the input is not focused, make it small */
input[type="search"] {
    width: var(--form-element-spacing-horizontal) !important;
    padding: 0;
    border: none;
    background: none;
    transition: width 0.2s ease-in-out;
    margin: 0;
}

/* If the input is focused, make it big */
input[type="search"]:focus {
    width: 100% !important;
}

li.search {
    position: relative;
    width: max-content;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 10000;
    background: var(--card-background-color);
    left: var(--form-element-spacing-horizontal);
    padding: var(--form-element-spacing-vertical) var(--form-element-spacing-horizontal);
    min-width: 200px;
}

.search-results li {
    width: 100%;
}
</style>