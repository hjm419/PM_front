import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import { OhVueIcon, addIcons } from 'oh-vue-icons';

// (★수정★) BiList 및 통계 페이지 아이콘 추가
import {
    BiGrid,
    BiDisplay,
    BiBarChart,
    BiInfoCircle,
    BiSearch,
    BiMap,
    BiBoxArrowRight,
    BiList, // (기존 추가됨)

    // (★추가★) 통계 페이지 아이콘
    BiPeople,
    BiCursor,
    BiActivity,
    BiExclamationTriangle,
    BiGraphUp,
    BiShieldCheck,
    BiAward,
    BiCalendarEvent,
    BiFileEarmarkText,

    // (★수정★) BiXlg -> BiXLg (L이 대문자입니다)
    BiXLg,
} from 'oh-vue-icons/icons/bi';

// (★수정★) addIcons에 아이콘들 추가
addIcons(
    BiGrid,
    BiDisplay,
    BiBarChart,
    BiInfoCircle,
    BiSearch,
    BiMap,
    BiBoxArrowRight,
    BiList,

    // (★추가★)
    BiPeople,
    BiCursor,
    BiActivity,
    BiExclamationTriangle,
    BiGraphUp,
    BiShieldCheck,
    BiAward,
    BiCalendarEvent,
    BiFileEarmarkText,

    // (★수정★) BiXlg -> BiXLg
    BiXLg
);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.component('v-icon', OhVueIcon);

app.mount('#app');
