import { useMap } from "@/composables/map";
import { Map } from "@/types/map";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const Maps = useMap();

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: () =>
            import(/* webpackChunkName: "home" */ "@/views/HomeView.vue"),
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
            import(/* webpackChunkName: "ar" */ "@/views/ARView.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
            // Thanks for the following else-if https://github.com/vuejs/vue-router/issues/2072#issuecomment-605502951
        } else if (from && Object.keys(to.query).length) {
            if (to.fullPath.split('?')[0] == from.fullPath.split('?')[0]) return;
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
