import { Ref, ref } from "vue";
import axios from "axios";
import { User } from "@/types/user";

const user = ref(null) as Ref<User | null>;

const authenticateUser = (authenticableUser: User) => {
    user.value = authenticableUser;
}

const isLoading = ref(false);

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
    }, { withCredentials: true }).then((response) => {
        getUser();
    }).catch((error) => {
        console.log("Login error", error);
        alert(error.response.data.message);
    }).finally(() => {
        isLoading.value = false;
    });
}

const getCsrfToken = () => {
    isLoading.value = true;

    // Remove XSRF-TOKEN cookie and header
    axios.defaults.headers.common["X-CSRF-TOKEN"] = "";
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    return axios.get("/csrf-token", { withCredentials: true }).then((response) => {
        // Set the incoming cookies to the cookie jar
        console.log(response.headers);
        axios.defaults.headers.common["X-XSRF-TOKEN"] = response.data;
        return response.data;
    }).catch((error) => {
        console.log("CSRF token error", error);
        alert(error.response.data.message);
    }).finally(() => {
        isLoading.value = false;
    });
}

const getUser = async () => {

    // We need to get another token - this one will come with a laravel_token which we will use to auth all our API calls later on
    await getCsrfToken();

    axios.get("/api/user", { withCredentials: true }).then((response) => {
        console.log("User: ", response.data, response);
        authenticateUser(response.data);
    }).catch((error) => {
        console.log("User error", error);
        alert(error.response.data.message);
    }).finally(() => {
        isLoading.value = false;
    });
}

export function useUser() {
    return {
        login,
        user,
        email,
        password,
    };
}