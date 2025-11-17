<template>
    <div class="realtime-container">
        <div class="map-wrapper">
            <RealtimeMap :districts="districts" :kickboards="allKickboards" />
        </div>

        <UserList :users="activeRides" :class="['user-list-panel', { closed: !isListOpen }]" />

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
import UserList from '@/components/UserList.vue'; // (★복원★)
import RealtimeMap from '@/components/RealtimeMap.vue';

// (★수정★) 2개의 데이터 소스 분리
const activeRides = ref([]); // (UserList용)
const allKickboards = ref([]); // (RealtimeMap용)

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
 * 1. UserList용 '실시간 운행' 목록 API 호출
 */
const fetchActiveRides = async () => {
    try {
        const response = await apiClient.get('/admin/rides/active');
        const mappedRides = response.kickboards.map((ride) => ({
            id: ride.userId,
            startTime: formatDateTime(ride.startTime).time,
            endTime: ride.startTime, // (경과 시간 계산용 원본 데이터)
            score: ride.safetyScore,
            lat: ride.location?.lat || 0, // (UserList는 lat/lng 사용 안함)
            lng: ride.location?.lng || 0, // (UserList는 lat/lng 사용 안함)
        }));
        activeRides.value = mappedRides;
    } catch (error) {
        console.error('실시간 운행(active rides) 데이터 로딩 실패:', error);
        activeRides.value = [];
    }
};

/**
 * (★신규★)
 * 2. RealtimeMap용 '모든 킥보드' 목록 API 호출
 */
const fetchAllKickboards = async () => {
    try {
        const response = await apiClient.get('/admin/kickboards');
        const mappedKickboards = response.kickboards.map((kb) => ({
            id: kb.pm_id,
            status: kb.pm_status, // 'in_use', 'available', 'maintenance'
            lat: kb.location?.lat || 35.8244,
            lng: kb.location?.lng || 128.738,
        }));
        allKickboards.value = mappedKickboards;
    } catch (error) {
        console.error('실시간 킥보드(all kickboards) 데이터 로딩 실패:', error);
        allKickboards.value = [];
    }
};

/**
 * (★신규★)
 * 15초마다 2개의 API를 동시에 호출하는 함수
 */
const fetchAllData = () => {
    fetchActiveRides();
    fetchAllKickboards();
};

onMounted(() => {
    fetchAllData(); // 1. 페이지 로드 시 즉시 1회 호출

    // (★추가★) 2. 15초(15000ms)마다 fetchAllData 함수를 반복 호출
    timer.value = setInterval(fetchAllData, 15000);
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
/* (★복원★) UserList 패널 스타일 */
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
/* (★복원★) 토글 버튼 스타일 */
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
