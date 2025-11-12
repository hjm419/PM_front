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
                            <p>{{ rideDetail.helmetOn ? '착용' : 'N/A' }}</p>
                        </div>
                        <div>
                            <p>위험 행동 (총)</p>
                            <p>{{ rideDetail.abruptCount }}회</p>
                        </div>
                    </div>
                </div>

                <div class="dialog-section">
                    <h3 class="dialog-section-title">운행 중 이벤트 (GPS 경로)</h3>
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

// (★수정★) API의 Timestamp (ISO string)에서 날짜/시간 추출
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
 * API 경로를 '/api/admin/rides'로 변경
 * API 명세서에 맞게 params와 데이터 매핑 수정
 */
const fetchRides = async (page) => {
    if (page < 1 || (page > totalPages.value && totalRides.value > 0)) {
        return;
    }

    isLoading.value = true;

    try {
        currentPage.value = page;
        // (★핵심 수정★) API 명세서에 맞게 startDate, endDate 파라미터 추가
        const params = {
            page: page,
            size: ridesPerPage,
            userId: userId.value || null, // 빈 문자열 대신 null
            pmId: deviceId.value || null, // 빈 문자열 대신 null
            startDate: startDate.value || null, // 날짜 필터 추가
            endDate: endDate.value || null, // 날짜 필터 추가
        };

        // (★수정★) API 경로: /trip/selectUserLogs.json -> /admin/rides
        const response = await apiClient.get('/admin/rides', { params });

        // (★수정★) API 명세서 응답 형식에 맞춤
        totalRides.value = response.totalCount || 0;
        totalPages.value = Math.ceil(totalRides.value / ridesPerPage) || 1;

        // (★수정★) API 명세서 필드명에 맞게 매핑
        rides.value = response.rides.map((ride) => {
            const startTime = formatDateTime(ride.startTime);
            const endTime = formatDateTime(ride.endTime);

            return {
                date: startTime.date,
                userId: ride.userId,
                deviceId: ride.rideId, // (T_RIDE의 PK인 ride_id)
                startTime: startTime.time,
                endTime: endTime.time,
                score: ride.safetyScore, // (★핵심 수정★) API 명세서에 추가된 safetyScore 사용

                // (★유지★) 상세 다이얼로그에서 사용할 Mock 데이터 (API에 없음)
                helmetOn: false,
                abruptCount: 0,
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
 * 상세 정보 API를 '/api/admin/rides/{rideId}/risks'로 변경
 */
const openRideDetail = async (ride) => {
    selectedRide.value = ride;
    rideDetail.value = null; // 로딩 시작

    try {
        // (★핵심 수정★) API 명세서의 GET /admin/rides/{rideId}/risks 호출
        // (기존: /api/admin/rides-logs)
        // 파라미터가 URL 경로의 일부가 되었으므로 params 객체 제거
        const logResponse = await apiClient.get(`/admin/rides/${ride.deviceId}/risks`);

        // (★신규★) API 응답(log.location)을 프론트엔드 형식으로 매핑
        const gpsEvents = logResponse.logs.map((log) => ({
            time: formatDateTime(log.timestamp).time,
            kpiName: log.kpiName,
            // (GeoPoint가 {lat, lng} 객체라고 가정)
            locationString: log.location ? `${log.location.lat}, ${log.location.lng}` : 'N/A',
        }));

        // (★수정★) 목록 데이터(ride)와 API 데이터(gpsEvents)를 조합
        rideDetail.value = {
            ...ride,
            events: gpsEvents,
        };
    } catch (error) {
        console.error('운행 상세 로그 조회 실패:', error);
        // (★수정★) 로그 조회에 실패해도, 기본 정보는 표시
        rideDetail.value = {
            ...ride,
            events: [], // 이벤트는 빈 배열로
        };
        alert('상세 운행 로그(GPS) 로딩에 실패했습니다. 기본 정보만 표시됩니다.');
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
