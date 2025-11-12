<template>
    <div class="tab-container">
        <div class="search-form">
            <InfoInput v-model="searchTerm" placeholder="기기 고유 번호(PM ID)로 검색" :hasIcon="true">
                <template #icon><v-icon name="bi-search" /></template>
            </InfoInput>
            <InfoButton variant="default" @click="applySearch">검색</InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">PM ID (기기 번호)</th>
                        <th class="info-table-head">모델명</th>
                        <th class="info-table-head">현재 상태</th>
                        <th class="info-table-head">배터리</th>
                        <th class="info-table-head">현재 위치</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="isLoading">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            기기 목록을 불러오는 중입니다...
                        </td>
                    </tr>
                    <tr v-else-if="filteredDevices.length === 0">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            {{ searchTerm ? '검색된 기기가 없습니다.' : '조회된 기기가 없습니다.' }}
                        </td>
                    </tr>
                    <tr
                        v-for="device in filteredDevices"
                        :key="device.id"
                        class="info-table-row clickable"
                        @click="openDeviceDetail(device)"
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

        <InfoDialog :open="!!selectedDevice" title="기기 상세 정보" @update:open="closeDialog">
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

            <div class="dialog-section action-buttons">
                <InfoButton variant="outline" @click="handleRemoteLock">원격 잠금</InfoButton>
                <InfoButton variant="outline" @click="handleSetMaintenance">수리 중으로 변경</InfoButton>
            </div>
        </InfoDialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
import InfoDialog from '../ui/InfoDialog.vue';

const searchTerm = ref('');
const selectedDevice = ref(null);
const isLoading = ref(true);
const allDevices = ref([]);
const currentSearch = ref('');

// (★제거★) '기기 이력' 관련 ref 2개 제거
// const isDetailLoading = ref(false);
// const deviceHistory = ref([]);

// (★제거★) '기기 이력' 날짜 포맷 함수 제거
// const formatHistoryDate = (dateTimeString) => { ... };

const fetchDevices = async () => {
    isLoading.value = true;
    try {
        const response = await apiClient.get('/admin/kickboards');

        allDevices.value = response.kickboards.map((kickboard) => {
            const lat = kickboard.location?.lat || 'N/A';
            const lng = kickboard.location?.lng || 'N/A';

            return {
                id: kickboard.pm_id,
                model: kickboard.model || 'N/A',
                status: kickboard.pmStatus,
                battery: kickboard.battery,
                location: `${lat}, ${lng}`,
            };
        });
    } catch (error) {
        console.error('기기 목록 조회 실패:', error);
        allDevices.value = [];
    } finally {
        isLoading.value = false;
    }
};

const applySearch = () => {
    currentSearch.value = searchTerm.value;
};

const filteredDevices = computed(() => {
    if (!currentSearch.value) {
        return allDevices.value;
    }
    return allDevices.value.filter((device) => device.id.toLowerCase().includes(currentSearch.value.toLowerCase()));
});

/**
 * (★수정★)
 * 다이얼로그 열기 (API 호출 로직 제거)
 */
const openDeviceDetail = (device) => {
    selectedDevice.value = device;
    // (★제거★) '기기 이력' API 호출 로직 모두 제거
};

/**
 * (★수정★)
 * 다이얼로그 닫기 (이력 초기화 로직 제거)
 */
const closeDialog = () => {
    selectedDevice.value = null;
    // (★제거★) deviceHistory.value = [];
};

// --- (v1.2 명세서 버튼 API 연동) ---

/**
 * 원격 잠금
 */
const handleRemoteLock = async () => {
    if (!selectedDevice.value) return;
    if (confirm(`정말로 ${selectedDevice.value.id} 기기를 원격 잠금하시겠습니까?`)) {
        try {
            await apiClient.post(`/admin/kickboards/${selectedDevice.value.id}/lock`);
            alert('기기가 원격 잠금되었습니다.');
            // (참고: 필요 시 목록 새로고침)
            // fetchDevices();
            // closeDialog();
        } catch (error) {
            console.error('원격 잠금 실패:', error);
            alert('원격 잠금에 실패했습니다.');
        }
    }
};

/**
 * 수리 중으로 변경
 */
const handleSetMaintenance = async () => {
    if (!selectedDevice.value) return;
    if (confirm(`정말로 ${selectedDevice.value.id} 기기의 상태를 '수리중'으로 변경하시겠습니까?`)) {
        try {
            await apiClient.put(`/admin/kickboards/${selectedDevice.value.id}`, {
                pmStatus: '수리중',
            });
            // (★수정★) 바깥 따옴표를 큰따옴표로 변경
            alert("기기 상태가 '수리중'으로 변경되었습니다.");

            fetchDevices();
            closeDialog();
        } catch (error) {
            console.error('상태 변경 실패:', error);
            alert('상태 변경에 실패했습니다.');
        }
    }
};

const getStatusVariant = (status) => {
    switch (status) {
        case '사용중':
            return 'default';
        case '대기':
            return 'secondary';
        case '수리중':
            return 'destructive';
        default:
            return 'default';
    }
};

onMounted(() => {
    fetchDevices();
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
