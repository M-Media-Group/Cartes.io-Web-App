import { useMap } from "@/composables/map";
import { Map } from "@/types/map";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const Maps = useMap();

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: () =>
            import(/* webpackChunkName: "MapView" */ "@/views/HomeView.vue"),
    },
    {
        path: "/maps/:mapId",
        name: "maps",
        component: () =>
            import(/* webpackChunkName: "MapView" */ "@/views/MapView.vue"),
    },
    {
        path: "/maps/:mapId/embed",
        name: "embed",
        component: () =>
            import(/* webpackChunkName: "EmbedView" */ "@/views/MapEmbedView.vue"),
    },
    {
        path: "/maps/:mapId/ar",
        name: "ar",
        component: () =>
            import(/* webpackChunkName: "EmbedView" */ "@/views/MapEmbedView.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { top: 0 };
        }
    },
});

router.beforeEach(async (to, from) => {
    // We are using beforeEach instead of beforeEnter on the individual route because beforeEach is also called when the view/component updates (when going from one mapId to another)
    if (to.params.mapId) {
        Maps.getMap(to.params.mapId as string).then((map) => {
            // pass the map to the view
            if (map) {
                to.params.map = map as any;
            }
        }).catch((e) => {
            alert(e.message);
            router.push("/");
            return false
        });
    }
})

export default router;
