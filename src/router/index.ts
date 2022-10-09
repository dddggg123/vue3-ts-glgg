import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'welcome',
        component: () => import("@/pages/welcome/welcome.vue")
    },
    {
        path: '/game',
        name: 'game',
        component: () => import("@/pages/game/game.vue")
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;