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
// (★수정★) onUnmounted 추가
import { ref, onMounted, onUnmounted } from 'vue';
import apiClient from '@/api/index.js';
import UserList from '@/components/UserList.vue';
import RealtimeMap from '@/components/RealtimeMap.vue';

const users = ref([]);
const districts = ref({});
const isListOpen = ref(true);

// (★추가★) 자동 새로고침 타이머 ID
const timer = ref(null);

/**
 * (★신규★)
 * 날짜 포맷팅 헬퍼 (RideHistoryTab에서 가져옴)
 */
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
        return { date: 'N/A', time: 'N/A' };
    }
    try {
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) {
            return { date: 'Invalid Date', time: 'Invalid Date' };
        }
        const date = dateObj.toISOString().split('T')[0];
        const time = dateObj.toTimeString().split(' ')[0];
        return { date, time };
    } catch (e) {
        return { date: 'N/A', time: 'N/A' };
    }
};

/**
 * (★신규★)
 * API 호출 로직을 별도 함수로 분리
 */
const fetchActiveRides = async () => {
    try {
        // (★수정★) '/api' 중복 제거
        const response = await apiClient.get('/admin/rides/active');

        const mappedUsers = response.kickboards.map((ride) => {
            const lat = ride.location?.lat || 35.8244; // 기본 위도
            const lng = ride.location?.lng || 128.738; // 기본 경도

            return {
                // --- UserList.vue용 필드 ---
                id: ride.userId,
                // (★수정★) '운행 시작'용 (포맷된 시간)
                startTime: formatDateTime(ride.startTime).time,
                // (★수정★) '경과 시간' 계산용 (원본 시간)
                endTime: ride.startTime,

                // --- RealtimeMap.vue + UserList.vue 공용 필드 ---
                score: ride.safetyScore,
                lat: lat,
                lng: lng,
            };
        });

        users.value = mappedUsers;
    } catch (error) {
        console.error('실시간 데이터 로딩 실패:', error);
        users.value = [];
    }
};

onMounted(() => {
    fetchActiveRides(); // 1. 페이지 로드 시 즉시 1회 호출

    // (★추가★) 2. 15초(15000ms)마다 fetchActiveRides 함수를 반복 호출
    timer.value = setInterval(fetchActiveRides, 15000);
});

/**
 * (★신규★)
 * 페이지를 떠날 때(컴포넌트가 파괴될 때) 타이머를 정리(제거)
 */
onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
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
