import { reactive, Ref, ref } from "vue";
import axios from "axios";
import { PersonalAccessToken, User } from "@/types/user";
import $bus, { eventTypes } from "@/eventBus/events";
import cartes from "@m-media/npm-cartes-io";

const user = ref(null) as Ref<User | null>;
const users = ref(null) as Ref<User[] | null>;

const userForm = reactive({
    email: "",
    description: "",
    password: "",
    username: "",
    is_public: false,
});

const formErrors = reactive({
    email: [],
    password: [],
    username: [],
});

const resetFormErrors = () => {
    formErrors.email = [];
    formErrors.password = [];
    formErrors.username = [];
}

const authenticateUser = (authenticableUser: User) => {
    user.value = authenticableUser;
    userForm.email = user.value.email;
    userForm.description = user.value.description ?? "";
    userForm.username = user.value.username;
    userForm.is_public = user.value.is_public;
}

const isLoading = ref(false);

const currentLocation = ref(null) as Ref<GeolocationCoordinates | null>;
const locationWatcherId = ref(null) as Ref<number | null>;

const watchUserLocation = () => {
    if (locationWatcherId.value !== null) {
        return;
    }

    function success(pos: GeolocationPosition) {
        currentLocation.value = pos.coords;
    }

    function error(err: GeolocationPositionError) {
        console.error(`ERROR(${err.code}): ${err.message}`);
        $bus.$emit(eventTypes.failed_to_enable_location, err);
        stopWatchingUserLocation();
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    locationWatcherId.value = navigator.geolocation.watchPosition(success, error, options);

    $bus.$emit(eventTypes.enabled_location);
}

const stopWatchingUserLocation = () => {
    if (locationWatcherId.value === null) {
        return
    }

    navigator.geolocation.clearWatch(locationWatcherId.value);
    locationWatcherId.value = null;
    currentLocation.value = null;
    $bus.$emit(eventTypes.disabled_location);
}

const toggleLocationTracking = () => {
    if (locationWatcherId.value !== null) {
        return stopWatchingUserLocation();
    }
    return watchUserLocation();
}

const getCsrfTokenFromCookie = () => {
    var _a;
    const xsrfToken = (_a = document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN"))) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    return decodeURIComponent(xsrfToken !== null && xsrfToken !== void 0 ? xsrfToken : "").trim();
}


const login = async () => {
    resetFormErrors();

    isLoading.value = true;

    // Remove laravel_token and laravel_session cookies
    document.cookie = "laravel_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    await getCsrfToken();

    axios.post("/login", {
        email: userForm.email,
        password: userForm.password,
    }).then(async () => {
        $bus.$emit(eventTypes.logged_in);
        getUser();
    }).catch((error) => {
        console.log("Login error", error);
        alert(error.response.data.message);
        formErrors.email = error.response.data?.errors?.email ?? [];
        isLoading.value = false;

    });
}

const sendPasswordReset = async () => {
    resetFormErrors();

    isLoading.value = true;

    // await getCsrfToken();

    axios.post("/password/email", {
        email: userForm.email,
    }).then(() => {
        $bus.$emit(eventTypes.sent_reset_password_email);
    }).catch((error) => {
        console.log("Password reset error", error);
        alert(error.response.data.message);
    }).finally(() => {
        isLoading.value = false;
    });
}

const register = async () => {
    resetFormErrors();

    isLoading.value = true;

    // Remove laravel_token and laravel_session cookies
    document.cookie = "laravel_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "laravel_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    await getCsrfToken();

    axios.post("/register", {
        email: userForm.email,
        password: userForm.password,
        username: userForm.username,
        password_confirmation: userForm.password,
    }).then(async () => {
        $bus.$emit(eventTypes.registered);
        getUser();
    }
    ).catch((error) => {
        console.log("Register error", error);
        alert(error.response.data.message);
        formErrors.email = error.response.data?.errors?.email ?? [];
        formErrors.password = error.response.data?.errors?.password ?? [];
        formErrors.username = error.response.data?.errors?.username ?? [];
        isLoading.value = false;
    });
}

const logout = () => {
    // Delete all cookies
    axios.post("/logout").then(async () => {
        $bus.$emit(eventTypes.logged_out, user.value);
        user.value = null;
    }).catch((error) => {
        console.log("Logout error", error);
    });
}

const getCsrfToken = () => {

    return axios.get("/csrf-token").then((response) => {
        axios.defaults.headers.common["X-XSRF-TOKEN"] = getCsrfTokenFromCookie();

        return;
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

    cartes.me().get().then((response) => {
        authenticateUser(response);
    }).catch((error) => {
        console.log("User error", error);
    }).finally(() => {
        isLoading.value = false;
    });
}

const getUsers = async () => {
    // Check if axios has a laravel_token cookie
    const laravel_token = document.cookie.match(/laravel_token=([^;]+)/);
    if (!laravel_token) {
        // We need to get another token - this one will come with a laravel_token which we will use to auth all our API calls later on
        await getCsrfToken();
    }

    cartes.users().get().then((response) => {

        // Order response.data by maps_count
        users.value = response.data.sort((a: User, b: User) => {
            return (b.public_maps_count ?? 0) - (a.public_maps_count ?? 0);
        });

    }).catch((error) => {
        console.log("User error", error);
    });
}

const updateUser = async () => {
    isLoading.value = true;

    if (!user.value) {
        return;
    }

    cartes.me().update(userForm).then((response) => {
        $bus.$emit(eventTypes.updated_user, response);
        user.value = response;
    }).catch((error) => {
        console.log("Update error", error);
        alert(error.response.data.message);
        isLoading.value = false;
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

const createPersonalAccessToken = (name: string) => {
    return axios.post('/oauth/personal-access-tokens', {
        name: name,
    }).then((response) => {
        $bus.$emit(eventTypes.created_personal_access_token, response.data);
        return response.data;
    }).catch((error) => {
        console.log("Personal access tokens error", error);
        alert(error.response.data.message);
    }).finally(() => {
        isLoading.value = false;
    });
}

export function useUser() {
    return {
        login,
        getUser,
        getPersonalAccessTokens,
        createPersonalAccessToken,
        logout,
        register,
        sendPasswordReset,
        watchUserLocation,
        stopWatchingUserLocation,
        toggleLocationTracking,
        locationWatcherId,
        isLoading,
        user,
        userForm,
        formErrors,
        users,
        updateUser,
        getUsers,
        currentLocation,
    };
}