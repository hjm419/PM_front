<template>
    <div class="tab-container">
        <div class="search-form">
            <InfoInput v-model="searchTerm" placeholder="기기 고유 번호(Serial No.)로 검색" :hasIcon="true">
                <template #icon><v-icon name="bi-search" /></template>
            </InfoInput>
            <InfoButton variant="default">검색</InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">기기 번호</th>
                        <th class="info-table-head">모델명</th>
                        <th class="info-table-head">현재 상태</th>
                        <th class="info-table-head">배터리</th>
                        <th class="info-table-head">현재 위치</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr
                        v-for="device in mockDevices"
                        :key="device.id"
                        class="info-table-row clickable"
                        @click="selectedDevice = device"
                    >
                        <td class="info-table-cell">{{ device.id }}</td>
                        <td class="info-table-cell">{{ device.model }}</td>
                        <td class="info-table-cell">
                            <InfoBadge :variant="getStatusVariant(device.status)">{{ device.status }}</InfoBadge>
                        </td>
                        <td class="info-table-cell">{{ device.battery }}%</td>
                        <td class="info-table-cell">{{ device.location }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <InfoDialog :open="!!selectedDevice" title="기기 상세 정보" @update:open="selectedDevice = null">
            <div class="dialog-section">
                <h3 class="dialog-section-title">기기 상태</h3>
                <div class="info-grid">
                    <div>
                        <p class="text-gray-600 mb-2">배터리 잔량</p>
                        <div class="flex-items-center">
                            <div class="progress-bar-container">
                                <div class="progress-bar" :style="{ width: `${selectedDevice?.battery || 0}%` }"></div>
                            </div>
                            <span class="text-gray-900">{{ selectedDevice?.battery }}%</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-gray-600 mb-2">현재 위치</p>
                        <div class="flex-items-center">
                            <v-icon name="bi-map" class="icon text-gray-600" />
                            <p class="text-gray-900">{{ selectedDevice?.location }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="dialog-section">
                <h3 class="dialog-section-title">위치 지도</h3>
                <div class="map-placeholder">
                    <v-icon name="bi-map" class="icon" />
                    <p>지도 표시 영역</p>
                    <p>{{ selectedDevice?.location }}</p>
                </div>
            </div>

            <div class="dialog-section">
                <h3 class="dialog-section-title">기기 이력</h3>
                <div class="info-table-wrapper" style="max-height: 256px; overflow-y: auto">
                    <table class="info-table">
                        <thead class="info-table-header">
                            <tr>
                                <th class="info-table-head">날짜</th>
                                <th class="info-table-head">이력 내용</th>
                            </tr>
                        </thead>
                        <tbody class="info-table-body">
                            <tr v-for="(record, idx) in mockDeviceHistory" :key="idx" class="info-table-row">
                                <td class="info-table-cell">{{ record.date }}</td>
                                <td class="info-table-cell">{{ record.content }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="dialog-section action-buttons">
                <InfoButton variant="outline">원격 잠금</InfoButton>
                <InfoButton variant="outline">수리 중으로 변경</InfoButton>
            </div>
        </InfoDialog>
    </div>
</template>

<script setup>
import { ref } from 'vue';
// (★수정★) './ui/' -> '../ui/' 상대 경로로 변경
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
import InfoDialog from '../ui/InfoDialog.vue';
const searchTerm = ref('');
const selectedDevice = ref(null);

const mockDevices = [
    { id: 'D-2024-001', model: 'KickGo Pro', status: '대여중', battery: 85, location: '강남역 2번 출구' },
    { id: 'D-2024-002', model: 'KickGo Lite', status: '대기', battery: 100, location: '서초역 3번 출구' },
    { id: 'D-2024-003', model: 'KickGo Pro', status: '수리중', battery: 45, location: '정비센터' },
    { id: 'D-2024-004', model: 'KickGo Max', status: '대여중', battery: 72, location: '역삼역 1번 출구' },
    { id: 'D-2024-005', model: 'KickGo Lite', status: '대기', battery: 95, location: '선릉역 4번 출구' },
];

const mockDeviceHistory = [
    { date: '2024-11-03', content: '정기 점검 완료' },
    { date: '2024-10-28', content: '배터리 교체' },
    { date: '2024-10-15', content: '고장 신고 - 브레이크 이상' },
    { date: '2024-10-16', content: '수리 완료' },
];

const getStatusVariant = (status) => {
    switch (status) {
        case '대여중':
            return 'default';
        case '대기':
            return 'secondary';
        case '수리중':
            return 'destructive';
        default:
            return 'default';
    }
};
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
