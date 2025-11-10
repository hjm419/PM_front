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
// (★수정★) axios 삭제, apiClient 추가
import apiClient from '@/api/index.js';
import UserList from '@/components/UserList.vue';
import RealtimeMap from '@/components/RealtimeMap.vue';

const users = ref([]);
const districts = ref({}); // (★수정★) districts API는 없으므로 빈 객체로 유지

// 사용자 목록 표시 상태 (기존과 동일)
const isListOpen = ref(true);

onMounted(async () => {
    try {
        // (★수정★) Mock 서버 API 호출(districtResponse 포함) 삭제
        /*
        const [userResponse, districtResponse] = await Promise.all([
            axios.get('http://localhost:3000/api/realtime-users'),
            axios.get('http://localhost:3000/api/districts'),
        ]);
        */

        // (★추가★) Spring 백엔드의 selectLogs.json API 호출
        // TripServiceImpl.java에서 페이징 처리를 하므로 파라미터 전송
        const params = {
            currentPage: 1,
            perPage: 50, // 우선 50개만 불러오도록 설정
        };
        const response = await apiClient.post('/api/trip/selectLogs.json', params);

        // (★수정★) 백엔드 데이터(response.result)를 프론트엔드(UserList, RealtimeMap)에 맞게 매핑
        const mappedUsers = response.result.map((user) => {
            return {
                id: user.user_id,
                score: user.final_score,
                lat: user.trip_latitude,
                lng: user.trip_longitude,
                // (★수정★) trip-SQL.xml의 별칭(trip_start_date, trip_end_date)을 사용합니다.
                startTime: user.trip_start_date,
                endTime: user.trip_end_date,
            };
        });

        users.value = mappedUsers;
        // districts.value = districtResponse.data.districts; // (★삭제★)
    } catch (error) {
        console.error('실시간 데이터 로딩 실패:', error);
    }
});
</script>

<style scoped>
.realtime-container {
    position: relative; /* 자식 요소(UserList, Button)를 absolute로 띄우기 위함 */
    height: 100%;
    overflow: hidden;
    padding: 0; /* 지도가 꽉 차도록 */
}

.map-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/*
  UserList.vue 컴포넌트 자체를 패널로 사용합니다.
  (UserList.css의 height: 100%가 여기서 잘 작동함)
*/
.user-list-panel {
    position: absolute;
    top: 24px;
    left: 24px;
    bottom: 24px;
    width: 380px; /* 기존 UserList 너비 */
    z-index: 10;

    /* (★핵심★) 슬라이드 애니메이션 */
    transform: translateX(0);
    transition: transform 0.3s ease-in-out;
}

/* (★추가★) 닫혔을 때의 스타일 */
.user-list-panel.closed {
    /* (★핵심★) 화면 밖으로 밀어냄 */
    transform: translateX(calc(-100% - 24px)); /* (너비 + left값) */
}

.list-toggle-button {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 20; /* UserList 패널(10)보다 위에 */

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
    color: #374151; /* 아이콘 색상 */

    /* (★핵심★) 버튼 위치 트랜지션 */
    transition: transform 0.3s ease-in-out;
}

/* (★추가★) 목록이 열려있을 때 버튼을 밀어냄 */
.list-toggle-button.list-open {
    transform: translateX(calc(380px + 24px)); /* 목록너비(380) + 목록 left(24) */
}
</style>
