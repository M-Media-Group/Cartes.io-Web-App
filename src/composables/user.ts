import { Ref, ref } from "vue";
import axios from "axios";
import { PersonalAccessToken, User } from "@/types/user";
import router from "@/router";
import $bus, { eventTypes } from "@/eventBus/events";

const user = ref(null) as Ref<User | null>;

const authenticateUser = (authenticableUser: User) => {
    user.value = authenticableUser;
}

const isLoading = ref(false);

const username = ref("");
const email = ref("");
const password = ref("");

const login = async () => {
    isLoading.value = true;

    // Remove laravel_token and laravel_session cookies
    document.cookie = "laravel_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    await getCsrfToken();

    axios.post("/login", {
        email: email.value,
        password: password.value,
    }).then((response) => {
        $bus.$emit(eventTypes.logged_in);
        router.push("/");
        getUser();
    }).catch((error) => {
        console.log("Login error", error);
        alert(error.response.data.message);
        isLoading.value = false;

    });
}

const register = async () => {
    isLoading.value = true;

    // Remove laravel_token and laravel_session cookies
    document.cookie = "laravel_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    await getCsrfToken();

    axios.post("/register", {
        email: email.value,
        password: password.value,
        username: username.value,
        password_confirmation: password.value,
    }).then((response) => {
        $bus.$emit(eventTypes.registered);
        router.push("/");
        getUser();
    }
    ).catch((error) => {
        console.log("Register error", error);
        alert(error.response.data.message);
        isLoading.value = false;
    });

}

const logout = () => {
    // Delete all cookies
    axios.post("/logout").then(() => {
        $bus.$emit(eventTypes.logged_out, user.value);
        user.value = null;
        router.push("/login");
    }).catch((error) => {
        console.log("Logout error", error);
    });
}

const getCsrfToken = () => {

    // Remove XSRF-TOKEN cookie and header
    axios.defaults.headers.common["X-CSRF-TOKEN"] = "";
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return axios.get("/csrf-token").then((response) => {
        // Set the incoming cookies to the cookie jar
        axios.defaults.headers.common["X-XSRF-TOKEN"] = response.data;
        return response.data;
    }).catch((error) => {
        console.log("CSRF token error", error);
        alert(error.response.data.message);
    });
}

const getUser = async () => {

    isLoading.value = true;

    // Check if axios has a laravel_token cookie
    const laravel_token = document.cookie.match(/laravel_token=([^;]+)/);
    if (!laravel_token) {
        // We need to get another token - this one will come with a laravel_token which we will use to auth all our API calls later on
        await getCsrfToken();
    }

    axios.get("/api/user").then((response) => {
        authenticateUser(response.data);
    }).catch((error) => {
        console.log("User error", error);
    }).finally(() => {
        isLoading.value = false;
    });
}

const getPersonalAccessTokens = () => {
    return axios.get('/oauth/personal-access-tokens').then((response) => {
        if (!user.value) {
            return [] as PersonalAccessToken[];
        }
        user.value.personal_access_tokens = response.data;
        return response.data as PersonalAccessToken[];
    }).catch((error) => {
        console.log("Personal access tokens error", error);
        return [] as PersonalAccessToken[];
    });
}

export function useUser() {
    return {
        login,
        getUser,
        getPersonalAccessTokens,
        logout,
        register,
        isLoading,
        user,
        username,
        email,
        password,
    };
}