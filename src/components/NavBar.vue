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

const search = async (query: string) => {
    console.log(query);
    const results = await searchForMap(query);
    if (!results) {
        return;
    }
    searchResults.value = results.data;

    // If there is only one result, navigate to it
    if (results.data.length === 1) {
        router.push({
            path: '/maps/' + results.data[0].uuid,
        });
    }
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
            <li style="display:none;">
                <input type="search"
                    placeholder="search"
                    @focus="searchIsFocused = true"
                    @blur="searchIsFocused = false"
                    @keyup="search(($event.target as any)?.value)"
                    list="search-results" />

                <datalist id="search-results">
                    <option v-for="result in searchResults"
                        :value="result.title"
                        @click="$router.push(`/maps/${result.uuid}`)" />
                </datalist>
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