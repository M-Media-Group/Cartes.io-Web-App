import { useMap } from "@/composables/map";
import { createRouter, createWebHistory, RouteLocationNormalized, RouteRecordRaw } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";
import { setMetaAttributes, setFollow, setTitle, setDescription } from "./metaTagsHandler";
import axios from "axios";
import { useProgress } from "@marcoschulte/vue3-progress";

const Maps = useMap();

const pathStayedTheSame = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    if (from && Object.keys(to.query).length) {
        if (to.fullPath.split('?')[0] == from.fullPath.split('?')[0]) return true;
    }
    return false;
};

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Home",
        component: () =>
            import(/* webpackChunkName: "home" */ "@/views/HomeView.vue"),
        meta: {
            // title: 'About Page - Example App',
            // metaTags: [
            //     {
            //         name: 'description',
            //         content: 'The about page of our example app.'
            //     },
            //     {
            //         property: 'og:description',
            //         content: 'The about page of our example app.'
            //     }
            // ]
        },
    },
    {
        path: "/maps/create",
        name: "Create Map",
        component: () =>
            import(/* webpackChunkName: "MapView" */ "@/views/CreateMapView.vue"),
    },
    {
        path: "/maps/:mapId",
        name: "Maps",
        component: () =>
            import(/* webpackChunkName: "MapView" */ "@/views/MapView.vue"),
    },
    {
        path: "/maps/:mapId/embed",
        name: "Maps/Embed",
        component: () =>
            import(/* webpackChunkName: "EmbedView" */ "@/views/MapEmbedView.vue"),
    },
    {
        path: "/maps/:mapId/ar",
        name: "Maps/AR",
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/ARView.vue"),
    },
    {
        path: "/login",
        name: "Login",
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/auth/LoginView.vue"),
    },
    {
        path: "/register",
        name: "Register",
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/auth/RegisterView.vue"),
    },
    {
        path: "/forgot-password",
        name: "PasswordReset",
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/auth/ResetPasswordView.vue"),
    },
    {
        path: "/me",
        name: "MyAccount",
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/auth/MyProfileView.vue"),
    },
    {
        path: "/users",
        name: "Users",
        props: true,
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/UsersView.vue"),
    },
    {
        path: "/users/:username",
        name: "User",
        props: true,
        component: () =>
            import(/* webpackChunkName: "ar" */ "@/views/UserProfileView.vue"),
    },
    // 404 page
    {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: () =>
            import(/* webpackChunkName: "404" */ "@/views/404View.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
            // Thanks for the following else-if https://github.com/vuejs/vue-router/issues/2072#issuecomment-605502951
        } else if (pathStayedTheSame(to, from)) {
            return;
        } else {
            return { top: 0 };
        }
    },
});

router.beforeEach(async (to, from, next) => {
    if (pathStayedTheSame(to, from)) {
        return next();
    }
    const progress = useProgress().start();

    setMetaAttributes(to, from);
    // We are using beforeEach instead of beforeEnter on the individual route because beforeEach is also called when the view/component updates (when going from one mapId to another)
    if (to.params.mapId) {
        await Maps.getMap(to.params.mapId as string).then((map) => {
            // pass the map to the view
            if (map) {
                to.params.map = map as any;
                const newName = (map.title ?? "Untitled map") + " - Cartes.io";
                // to.name = newName;
                setTitle(newName);
                setDescription(map.description);
                setFollow(map.privacy === "public");
            }
        }).catch((e) => {
            alert(e.message);
            router.push("/");
            return false
        });
    }

    if (to.params.username) {
        await axios.get(`/api/users/${to.params.username}?with[]=maps&with[]=contributions`).then((res) => {
            if (res.data) {
                to.params.user = res.data;
                setTitle(res.data.username + " - Cartes.io");
                setDescription(res.data.description);
                setFollow(res.data.is_public);
            }
        }).catch((e) => {
            alert(e.response.data.message);
            router.push("/");
            return false
        });
    }
    progress.finish();
    next();
})

router.afterEach((to, from, failure) => {
    if (pathStayedTheSame(to, from)) {
        return;
    }
    // to.name = document.title;
    if (!failure) {
        $bus.$emit(eventTypes.viewed_page, {
            ...to,
            name: document.title,
        });
    }
})

export default router;
