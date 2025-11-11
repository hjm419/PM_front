<template>
    <div class="realtime-container">
        <div class="map-wrapper">
            <RealtimeMap :districts="districts" :users="users" />
        </div>

        <UserList :users="users" :class="['user-list-panel', { closed: !isListOpen }]" />

        <button
            :class="['list-toggle-button', { 'list-open': isListOpen }]"
            @click="isListOpen = !isListOpen"
            title="목록 열기/닫기"
        >
            <v-icon name="bi-list" scale="1.5" />
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import UserList from '@/components/UserList.vue';
import RealtimeMap from '@/components/RealtimeMap.vue';

const users = ref([]);
const districts = ref({});

const isListOpen = ref(true);

onMounted(async () => {
    try {
        const params = {
            currentPage: 1,
            perPage: 50,
        };
        // (★수정★) '/api' 접두사 제거
        const response = await apiClient.post('/trip/selectLogs.json', params);

        const mappedUsers = response.map((user) => {
            return {
                id: user.user_id,
                score: user.final_score,
                lat: user.trip_latitude,
                lng: user.trip_longitude,
                startTime: user.trip_start_date,
                endTime: user.trip_end_date,
            };
        });

        users.value = mappedUsers;
    } catch (error) {
        console.error('실시간 데이터 로딩 실패:', error);
    }
});
</script>

<style scoped>
.realtime-container {
    position: relative;
    height: 100%;
    overflow: hidden;
    padding: 0;
}
.map-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.user-list-panel {
    position: absolute;
    top: 24px;
    left: 24px;
    bottom: 24px;
    width: 380px;
    z-index: 10;
    transform: translateX(0);
    transition: transform 0.3s ease-in-out;
}
.user-list-panel.closed {
    transform: translateX(calc(-100% - 24px));
}
.list-toggle-button {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 20;
    width: 44px;
    height: 44px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    transition: transform 0.3s ease-in-out;
}
.list-toggle-button.list-open {
    transform: translateX(calc(380px + 24px));
}
</style>
