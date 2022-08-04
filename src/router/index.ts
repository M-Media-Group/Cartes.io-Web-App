import { useMap } from "@/composables/map";
import { Map } from "@/types/map";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import $bus, { eventTypes } from "@/eventBus/events";
import { setMetaAttributes, setFollow, setTitle, setDescription } from "./metaTagsHandler";

const Maps = useMap();

const pathStayedTheSame = (to: any, from: any) => {
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
    setMetaAttributes(to, from, next);
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
                if (map.privacy === "private" || map.privacy === "unlisted") {
                    setFollow(false);
                }
            }
        }).catch((e) => {
            alert(e.message);
            router.push("/");
            return false
        });
    }
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
