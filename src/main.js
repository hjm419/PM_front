import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import { OhVueIcon, addIcons } from 'oh-vue-icons';

// (★수정★) BiGear 추가
import {
    BiGrid,
    BiDisplay,
    BiBarChart,
    BiInfoCircle,
    BiSearch,
    BiMap,
    BiBoxArrowRight,
    BiList,
    BiPeople,
    BiCursor,
    BiActivity,
    BiExclamationTriangle,
    BiGraphUp,
    BiShieldCheck,
    BiAward,
    BiCalendarEvent,
    BiFileEarmarkText,
    BiXLg,
    BiArrowsFullscreen,
    BiGear, // (★추가★) 설정 아이콘
} from 'oh-vue-icons/icons/bi';

// (★수정★) addIcons에 BiGear 추가
addIcons(
    BiGrid,
    BiDisplay,
    BiBarChart,
    BiInfoCircle,
    BiSearch,
    BiMap,
    BiBoxArrowRight,
    BiList,

    BiPeople,
    BiCursor,
    BiActivity,
    BiExclamationTriangle,
    BiGraphUp,
    BiShieldCheck,
    BiAward,
    BiCalendarEvent,
    BiFileEarmarkText,
    BiXLg,
    BiArrowsFullscreen,

    BiGear // (★추가★)
);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.component('v-icon', OhVueIcon);

app.mount('#app');
