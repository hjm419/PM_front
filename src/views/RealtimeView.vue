<template>
    <div class="realtime-container">
        <div class="map-wrapper">
            <RealtimeMap :districts="districts" :kickboards="allKickboards" />
        </div>

        <UserList
            :users="activeRides"
            :class="['user-list-panel', { closed: !isListOpen }]"
            @dismiss-accident="handleDismissAccident"
        />

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
import { ref, onMounted, onUnmounted } from 'vue';
import apiClient from '@/api/index.js';
import UserList from '@/components/UserList.vue';
import RealtimeMap from '@/components/RealtimeMap.vue';
import { useNotificationStore } from '@/stores/notification.store.js';

const activeRides = ref([]);
const allKickboards = ref([]);

const districts = ref({});
const isListOpen = ref(true);
const timer = ref(null);
const alertedAccidentIds = ref(new Set());
const notificationStore = useNotificationStore();

// (★수정★) "지운 항목" 목록을 ref로 선언 (초기값은 비어있음)
const dismissedAccidentRideIds = ref(new Set());
// (★신규★) sessionStorage에 저장할 때 사용할 키
const STORAGE_KEY = 'dismissed_accident_ids';

/**
 * 날짜 포맷팅 헬퍼
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
 * (★수정★) "X" 버튼 클릭 시, Set과 sessionStorage에 동시 저장하고 헤더 알림도 삭제
 * @param {string} rideId - UserList.vue에서 전달받은 rideId
 */
const handleDismissAccident = (rideId) => {
    // 1. (메모리) "지운 항목" 목록(Set)에 rideId를 추가
    dismissedAccidentRideIds.value.add(rideId);

    // 2. (브라우저 저장소) sessionStorage에 저장
    //    (Set을 Array로 변환 -> JSON 문자열로 변환하여 저장)
    const idArray = Array.from(dismissedAccidentRideIds.value);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(idArray));

    // 3. (UI) 즉시 UI 목록(activeRides)에서 제거
    activeRides.value = activeRides.value.filter((ride) => ride.rideId !== rideId);

    // 4. (★신규★) 헤더 알림 스토어에도 "이거 지워줘"라고 요청
    notificationStore.dismissNotification(rideId);
};

/**
 * (★수정★)
 * API 호출 및 "지워진" 항목 필터링
 */
const fetchAllData = async () => {
    try {
        // 1. 3개의 API를 동시에 호출
        const [activeResponse, completedAccidentResponse, kickboardResponse] = await Promise.all([
            apiClient.get('/admin/rides/active'), // (경로 수정됨)
            apiClient.get('/admin/rides/recent-accidents'), // (경로 수정됨)
            apiClient.get('/admin/kickboards'), // (경로 수정됨)
        ]);

        // 2. (지도용) 전체 킥보드 목록 매핑
        const mappedKickboards = kickboardResponse.kickboards.map((kb) => ({
            id: kb.pm_id,
            status: kb.pm_status,
            lat: kb.location?.lat || 35.8244,
            lng: kb.location?.lng || 128.738,
        }));
        allKickboards.value = mappedKickboards;

        // 3. (UserList용) API 응답 매핑
        // (1) 운행 중인 목록
        const mappedActiveRides = activeResponse.kickboards.map((ride) => ({
            id: ride.userId,
            rideId: ride.rideId,
            pmId: ride.pmId,
            startTime: formatDateTime(ride.startTime).time,
            elapsedTimeBase: ride.startTime,
            isCompleted: false,
            accident: ride.accident || false,
            score: ride.safetyScore,
        }));

        // (2) 종료된 사고 목록
        const mappedCompletedAccidents = completedAccidentResponse.kickboards.map((ride) => ({
            id: ride.userId,
            rideId: ride.rideId,
            pmId: ride.pmId,
            startTime: formatDateTime(ride.startTime).time,
            elapsedTimeBase: ride.startTime,
            isCompleted: true, // "운행 종료" 상태
            accident: ride.accident || false,
            score: ride.safetyScore,
        }));

        // 4. 두 목록 병합
        const allRidesMap = new Map();
        mappedCompletedAccidents.forEach((ride) => {
            allRidesMap.set(ride.rideId, ride);
        });
        mappedActiveRides.forEach((ride) => {
            allRidesMap.set(ride.rideId, ride);
        });

        // 5. (팝업 알림) "운행 중인 목록"에서만 새로 감지된 사고 확인
        for (const ride of allRidesMap.values()) {
            // 1) 사고가 true이고
            // 2) 이미 알림을 띄운 적이 없는 ID이고
            // 3) (선택사항) 사용자가 'X' 눌러서 지운 항목이 아닌 경우에만 알림
            if (
                ride.accident &&
                !alertedAccidentIds.value.has(ride.rideId) &&
                !dismissedAccidentRideIds.value.has(ride.rideId)
            ) {
                alert(`🚨 [사고 발생] 🚨\n\n사용자 ID: ${ride.id}\nPM ID: ${ride.pmId}\n\n즉시 확인이 필요합니다.`);

                // 알림 보냄 처리
                alertedAccidentIds.value.add(ride.rideId);

                // 필요하다면 소리 재생 로직 추가 (예: notificationStore.playAlertSound())
                notificationStore.fetchNotifications();
            }
        }

        // 6. Map을 배열로 변환
        const allRidesList = Array.from(allRidesMap.values());

        // 7. (★핵심★) "X" 버튼으로 지운 항목 필터링
        // (이때 'dismissedAccidentRideIds'는 sessionStorage에서 불러온 값을 포함함)
        const filteredList = allRidesList.filter((ride) => !dismissedAccidentRideIds.value.has(ride.rideId));

        // 8. 최종 목록을 'activeRides' ref에 반영
        activeRides.value = filteredList.sort((a, b) => {
            if (a.accident && !b.accident) return -1;
            if (!a.accident && b.accident) return 1;
            return 0;
        });
    } catch (error) {
        console.error('실시간 데이터 로딩 실패:', error);
        activeRides.value = activeRides.value.filter((ride) => !dismissedAccidentRideIds.value.has(ride.rideId));
        allKickboards.value = [];
    }
};

onMounted(() => {
    // (★신규★) 1. 페이지 로드 시, sessionStorage에서 "지운 목록"을 불러와 Set을 복원
    const storedIds = sessionStorage.getItem(STORAGE_KEY);
    if (storedIds) {
        try {
            const idArray = JSON.parse(storedIds);
            dismissedAccidentRideIds.value = new Set(idArray);
        } catch (e) {
            console.error('Failed to parse dismissed IDs from sessionStorage', e);
            sessionStorage.removeItem(STORAGE_KEY); // 잘못된 데이터면 삭제
        }
    }

    // 2. (기존) 데이터 즉시 1회 호출
    fetchAllData();
    // 3. (기존) 15초마다 반복 호출
    timer.value = setInterval(fetchAllData, 15000);
});

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
