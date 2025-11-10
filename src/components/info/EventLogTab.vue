<template>
    <div class="tab-container">
        <div class="filter-form">
            <div class="filter-grid-3-col">
                <div>
                    <label class="info-label">시작일</label>
                    <InfoInput type="date" v-model="startDate" />
                </div>
                <div>
                    <label class="info-label">종료일</label>
                    <InfoInput type="date" v-model="endDate" />
                </div>
                <div>
                    <InfoSelect label="알림 유형" v-model="eventType" :options="eventOptions" />
                </div>
            </div>
            <InfoButton variant="default" style="width: 100%" @click="fetchEvents(1)">
                <template #icon><v-icon name="bi-search" class="icon" /></template>
                검색
            </InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">발생 시간</th>
                        <th class="info-table-head">알림 유형</th>
                        <th class="info-table-head">상세 내용</th>
                        <th class="info-table-head">관련 사용자 ID</th>
                        <th class="info-table-head">관련 기기 번호</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="logs.length === 0">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            조회된 이벤트 로그가 없습니다.
                        </td>
                    </tr>
                    <tr v-for="(log, idx) in logs" :key="idx" class="info-table-row">
                        <td class="info-table-cell">{{ log.time }}</td>
                        <td class="info-table-cell">
                            <InfoBadge :variant="getEventTypeVariant(log.type)">{{ log.type }}</InfoBadge>
                        </td>
                        <td class="info-table-cell">{{ log.detail }}</td>
                        <td class="info-table-cell">{{ log.userId }}</td>
                        <td class="info-table-cell">{{ log.deviceId }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalLogs }}개의 이벤트 로그</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchEvents(currentPage - 1)"
                    :disabled="currentPage === 1"
                    >이전</InfoButton
                >
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchEvents(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    >다음</InfoButton
                >
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// (★수정★) apiClient와 컴포넌트 import 경로 수정
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
// (★수정★) InfoDialog는 이 탭에서 사용하지 않으므로 import 제거
// import InfoDialog from '../ui/InfoDialog.vue';
import InfoSelect from '../ui/InfoSelect.vue'; // (★추가★) InfoSelect import

// --- 검색 필터 ---
const startDate = ref('');
const endDate = ref('');
const eventType = ref('전체');

const eventOptions = [
    { value: '전체', label: '전체' },
    { value: '사고', label: '사고' },
    { value: '위험 행동', label: '위험 행동' },
    { value: '날씨', label: '날씨' },
    { value: '기기 고장', label: '기기 고장' },
];

// --- 목록 데이터 ---
const logs = ref([]); // 테이블에 표시될 목록
const currentPage = ref(1);
const totalPages = ref(1);
const totalLogs = ref(0);
const logsPerPage = 10;

// (★유지★) 백엔드 API가 없으므로 Mock 데이터를 유지합니다.
const mockEventLogs = [
    { time: '2024-11-05 14:32', type: '위험 행동', detail: '헬멧 미착용 감지', userId: 'U003', deviceId: 'D-2024-004' },
    { time: '2024-11-05 13:15', type: '사고', detail: '낙상 사고 발생', userId: 'U005', deviceId: 'D-2024-007' },
    { time: '2024-11-05 11:20', type: '기기 고장', detail: '배터리 이상 감지', userId: '-', deviceId: 'D-2024-003' },
    {
        time: '2024-11-05 10:05',
        type: '위험 행동',
        detail: '과속 감지 (28km/h)',
        userId: 'U002',
        deviceId: 'D-2024-002',
    },
    { time: '2024-11-05 09:30', type: '날씨', detail: '강우 경보 발령', userId: '-', deviceId: '-' },
    { time: '2024-11-04 18:45', type: '위험 행동', detail: '급가속 감지', userId: 'U001', deviceId: 'D-2024-001' },
    {
        time: '2024-11-04 16:22',
        type: '기기 고장',
        detail: '브레이크 고장 신고',
        userId: 'U004',
        deviceId: 'D-2024-006',
    },
];

/**
 * (★추가★)
 * 이벤트 로그를 서버에서 조회하는 함수 (검색 및 페이징)
 */
const fetchEvents = async (page) => {
    if (page < 1 || (page > totalPages.value && totalLogs.value > 0)) {
        return;
    }

    currentPage.value = page;

    // (★참고★)
    // 아래는 백엔드 API가 준비되었을 때 사용할 API 호출 코드 예시입니다.
    // 현재는 주석 처리하고 Mock 데이터를 대신 사용합니다.

    /*
    try {
        const params = {
            currentPage: page,
            perPage: logsPerPage,
            startDate: startDate.value,
            endDate: endDate.value,
            eventType: eventType.value === '전체' ? '' : eventType.value,
        };

        // Spring API 호출 (예: /api/events/selectList.json)
        // const response = await apiClient.post('/api/events/selectList.json', params);

        // totalLogs.value = response.count;
        // totalPages.value = Math.ceil(totalLogs.value / logsPerPage) || 1;
        // logs.value = response.result; // (API 응답 형식을 프론트엔드에 맞게 매핑)

    } catch (error) {
        console.error("이벤트 로그 조회 실패:", error);
        logs.value = [];
        totalLogs.value = 0;
        totalPages.value = 1;
    }
    */

    // (★임시★) Mock 데이터를 사용하여 페이징 흉내내기
    console.log('API 호출 시도 (현재 Mock 사용):', {
        page,
        startDate: startDate.value,
        endDate: endDate.value,
        eventType: eventType.value,
    });
    const filtered = mockEventLogs.filter((log) => {
        const matchType = eventType.value === '전체' || log.type === eventType.value;
        // (날짜 필터링은 생략)
        return matchType;
    });

    totalLogs.value = filtered.length;
    totalPages.value = Math.ceil(totalLogs.value / logsPerPage) || 1;
    const start = (page - 1) * logsPerPage;
    logs.value = filtered.slice(start, start + logsPerPage);
};

// (기존) 이벤트 유형에 따른 뱃지 색상
const getEventTypeVariant = (type) => {
    switch (type) {
        case '사고':
            return 'destructive';
        case '위험 행동':
            return 'default';
        case '기기 고장':
            return 'secondary';
        case '날씨':
            return 'outline';
        default:
            return 'default';
    }
};

// 컴포넌트가 마운트될 때 첫 페이지 조회
onMounted(() => {
    fetchEvents(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
