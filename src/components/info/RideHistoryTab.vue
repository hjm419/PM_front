<template>
    <div class="tab-container">
        <div class="filter-form">
            <div class="filter-grid">
                <div>
                    <label class="info-label">시작일</label>
                    <InfoInput type="date" v-model="startDate" />
                </div>
                <div>
                    <label class="info-label">종료일</label>
                    <InfoInput type="date" v-model="endDate" />
                </div>
                <div>
                    <label class="info-label">사용자 ID</label>
                    <InfoInput placeholder="사용자 ID 입력" v-model="userId" />
                </div>
                <div>
                    <label class="info-label">PM ID (기기 번호)</label>
                    <InfoInput placeholder="PM ID 입력" v-model="deviceId" />
                </div>
            </div>
            <InfoButton variant="default" style="width: 100%" @click="fetchRides(1)">
                <template #icon><v-icon name="bi-search" class="icon" /></template>
                검색
            </InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">운행일</th>
                        <th class="info-table-head">사용자 ID</th>
                        <th class="info-table-head">PM ID</th>
                        <th class="info-table-head">시작 시간</th>
                        <th class="info-table-head">종료 시간</th>
                        <th class="info-table-head">안전 점수</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="isLoading">
                        <td colspan="6" class="info-table-cell" style="text-align: center; height: 100px">
                            운행 기록을 불러오는 중입니다...
                        </td>
                    </tr>
                    <tr v-else-if="rides.length === 0">
                        <td colspan="6" class="info-table-cell" style="text-align: center; height: 100px">
                            조회된 운행 기록이 없습니다.
                        </td>
                    </tr>
                    <tr
                        v-for="(ride, idx) in rides"
                        :key="idx"
                        class="info-table-row clickable"
                        @click="openRideDetail(ride)"
                    >
                        <td class="info-table-cell">{{ ride.date }}</td>
                        <td class="info-table-cell">{{ ride.userId }}</td>
                        <td class="info-table-cell">{{ ride.deviceId }}</td>
                        <td class="info-table-cell">{{ ride.startTime }}</td>
                        <td class="info-table-cell">{{ ride.endTime }}</td>
                        <td class="info-table-cell">{{ ride.score }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalRides }}개의 운행 기록</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchRides(currentPage - 1)"
                    :disabled="currentPage === 1"
                    >이전</InfoButton
                >
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchRides(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    >다음</InfoButton
                >
            </div>
        </div>

        <InfoDialog :open="!!selectedRide" title="운행 상세 정보" @update:open="closeDialog">
            <div v-if="rideDetail">
                <div class="dialog-section">
                    <h3 class="dialog-section-title">운행 정보</h3>
                    <div class="info-grid">
                        <div>
                            <p>운행일</p>
                            <p>{{ rideDetail.date }}</p>
                        </div>
                        <div>
                            <p>사용자 ID</p>
                            <p>{{ rideDetail.userId }}</p>
                        </div>
                        <div>
                            <p>PM ID (Ride ID)</p>
                            <p>{{ rideDetail.deviceId }}</p>
                        </div>
                        <div>
                            <p>안전 점수</p>
                            <p>{{ rideDetail.score }}</p>
                        </div>
                        <div>
                            <p>출발 시간</p>
                            <p>{{ rideDetail.startTime }}</p>
                        </div>
                        <div>
                            <p>도착 시간</p>
                            <p>{{ rideDetail.endTime }}</p>
                        </div>
                        <div>
                            <p>헬멧 착용</p>
                            <p>{{ rideDetail.helmetOn ? '착용' : '미착용' }}</p>
                        </div>
                        <div>
                            <p>위험 행동 (총)</p>
                            <p>{{ rideDetail.abruptCount }}회</p>
                        </div>
                    </div>
                </div>

                <div class="dialog-section">
                    <h3 class="dialog-section-title">위치 지도 (GPS 경로)</h3>
                    <div
                        class="map-placeholder"
                        style="height: 10rem; text-align: left; padding: 1rem; overflow-y: auto"
                    >
                        <div v-if="rideDetail.pathLoading">GPS 경로를 불러오는 중입니다...</div>
                        <div v-else-if="!rideDetail.pathData || rideDetail.pathData.length === 0">
                            <p>저장된 GPS 경로 데이터가 없습니다.</p>
                        </div>
                        <div v-else>
                            <p>총 {{ rideDetail.pathData.length }}개의 GPS 포인트가 조회되었습니다.</p>
                            <pre style="font-size: 0.75rem">{{ rideDetail.pathData[0] }}</pre>
                        </div>
                    </div>
                </div>

                <div class="dialog-section">
                    <h3 class="dialog-section-title">운행 중 이벤트 (위험 로그)</h3>
                    <div class="info-table-wrapper" style="max-height: 256px; overflow-y: auto">
                        <table class="info-table">
                            <thead class="info-table-header">
                                <tr>
                                    <th class="info-table-head">발생 시간 (Timestamp)</th>
                                    <th class="info-table-head">위험 항목명 (KPI)</th>
                                    <th class="info-table-head">위치 (Location)</th>
                                </tr>
                            </thead>
                            <tbody class="info-table-body">
                                <tr v-if="rideDetail.events.length === 0">
                                    <td colspan="3" class="info-table-cell" style="text-align: center">
                                        상세 GPS 데이터가 없습니다.
                                    </td>
                                </tr>
                                <tr v-for="(event, idx) in rideDetail.events" :key="idx" class="info-table-row">
                                    <td class="info-table-cell">{{ event.time }}</td>
                                    <td class="info-table-cell">{{ event.kpiName }}</td>
                                    <td class="info-table-cell">{{ event.locationString }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div v-else style="min-height: 300px; display: flex; align-items: center; justify-content: center">
                <p>운행 상세 정보를 불러오는 중입니다...</p>
            </div>
        </InfoDialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoDialog from '../ui/InfoDialog.vue';

const startDate = ref('');
const endDate = ref('');
const userId = ref('');
const deviceId = ref(''); // (API 명세서의 pmId에 해당)
const isLoading = ref(true); // (★추가★)

const rides = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalRides = ref(0);
const ridesPerPage = 10;

const selectedRide = ref(null);
const rideDetail = ref(null);

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
 * (★수정★)
 * Mock 데이터 제거, API가 반환하는 helmetOn 사용
 */
const fetchRides = async (page) => {
    if (page < 1 || (page > totalPages.value && totalRides.value > 0)) {
        return;
    }

    isLoading.value = true;

    try {
        currentPage.value = page;
        const params = {
            page: page,
            size: ridesPerPage,
            userId: userId.value || null,
            pmId: deviceId.value || null,
            startDate: startDate.value || null,
            endDate: endDate.value || null,
        };

        const response = await apiClient.get('/admin/rides', { params });

        totalRides.value = response.totalCount || 0;
        totalPages.value = Math.ceil(totalRides.value / ridesPerPage) || 1;

        rides.value = response.rides.map((ride) => {
            const startTime = formatDateTime(ride.startTime);
            const endTime = formatDateTime(ride.endTime);

            return {
                date: startTime.date,
                userId: ride.userId,
                deviceId: ride.rideId,
                startTime: startTime.time,
                endTime: endTime.time,
                score: ride.safetyScore,

                // (★수정★) Mock Data -> Real Data
                helmetOn: ride.helmetOn, // (API에서 받아온 실제 헬멧 착용 여부)

                // (★수정★) Mock Data 제거 (상세 조회 시 API로 가져옴)
                // abruptCount: 0,
            };
        });
    } catch (error) {
        console.error('과거 운행 목록 조회 실패:', error);
        rides.value = [];
        totalRides.value = 0;
        totalPages.value = 1;
    } finally {
        isLoading.value = false;
    }
};

/**
 * (★수정★)
 * API 응답(totalCount)을 abruptCount에 매핑
 */
const openRideDetail = async (ride) => {
    selectedRide.value = ride;
    // (★수정★) pathData, pathLoading 필드 추가 및 abruptCount 초기화
    rideDetail.value = {
        ...ride,
        events: [],
        pathData: [],
        pathLoading: true,
        abruptCount: 0, // (기본값 0)
    }; // 로딩 시작 (기본 정보 먼저 표시)

    try {
        // 1. 위험 로그 (Risks) API 호출
        const logResponse = await apiClient.get(`/admin/rides/${ride.deviceId}/risks`);

        const gpsEvents = logResponse.logs.map((log) => ({
            time: formatDateTime(log.timestamp).time,
            kpiName: log.kpiName,
            locationString: log.location ? `${log.location.lat.toFixed(5)}, ${log.location.lng.toFixed(5)}` : 'N/A',
        }));

        rideDetail.value.events = gpsEvents;

        // (★이 줄을 추가★)
        rideDetail.value.abruptCount = logResponse.totalCount; // (실제 위험 횟수)
    } catch (error) {
        console.error('운행 상세 로그(Risks) 조회 실패:', error);
        rideDetail.value.events = [];
        alert('상세 운행 로그(Risks) 로딩에 실패했습니다.');
    }

    try {
        // 2. (★신규★) GPS 경로 (Path) API 호출
        const pathResponse = await apiClient.get(`/admin/rides/${ride.deviceId}/path`);
        rideDetail.value.pathData = pathResponse.pathData || [];
    } catch (error) {
        console.error('운행 상세 경로(Path) 조회 실패:', error);
        rideDetail.value.pathData = [];
    } finally {
        rideDetail.value.pathLoading = false;
    }
};

const closeDialog = () => {
    selectedRide.value = null;
    rideDetail.value = null;
};

onMounted(() => {
    fetchRides(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
