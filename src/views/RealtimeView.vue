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
        // (★수정★)
        // API 경로: /api/kickboards -> /api/admin/kickboards
        // API 명세서의 Query Params (page, size, status 등)를 사용할 수 있으나,
        // 여기서는 모든 킥보드를 가져오기 위해 param 없이 호출합니다.
        const response = await apiClient.get('/admin/kickboards');

        // (★수정★)
        // API 명세서 응답(response.kickboards)을 프론트엔드 'users' prop 형식으로 매핑합니다.
        const mappedUsers = response.kickboards.map((kickboard) => {
            // API 응답의 location 객체 (예: { lat: 37.5, lng: 127.5 }) 또는
            // DB 스키마의 GeoPoint를 파싱해야 함 (여기서는 객체로 가정)
            const lat = kickboard.location?.lat || 35.8244; // 기본 위도
            const lng = kickboard.location?.lng || 128.738; // 기본 경도

            return {
                // UserList.vue용 필드
                id: kickboard.pm_id, // ⬅️ 수정
                startTime: kickboard.pm_status, // ⬅️ 수정
                endTime: '', // 사용하지 않음

                // RealtimeMap.vue + UserList.vue 공용 필드
                score: kickboard.battery, // (battery)
                lat: lat,
                lng: lng,
            };
        });

        users.value = mappedUsers;
    } catch (error) {
        console.error('실시간 데이터 로딩 실패:', error);
        users.value = []; // 실패 시 빈 배열로 설정
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
