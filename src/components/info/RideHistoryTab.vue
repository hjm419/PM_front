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
                    <label class="info-label">기기 번호 (★백엔드 추가 구현 필요)</label>
                    <InfoInput placeholder="기기 번호 입력" v-model="deviceId" />
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
                        <th class="info-table-head">기기 번호</th>
                        <th class="info-table-head">시작 시간</th>
                        <th class="info-table-head">종료 시간</th>
                        <th class="info-table-head">안전 점수</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="rides.length === 0">
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
                        <td class="info-table-cell">{{ ride.score }}점</td>
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
                            <p>기기 번호 (Trip ID)</p>
                            <p>{{ rideDetail.deviceId }}</p>
                        </div>
                        <div>
                            <p>안전 점수</p>
                            <p>{{ rideDetail.score }}점</p>
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
                    <h3 class="dialog-section-title">운행 중 이벤트 (GPS 경로)</h3>
                    <div class="info-table-wrapper" style="max-height: 256px; overflow-y: auto">
                        <table class="info-table">
                            <thead class="info-table-header">
                                <tr>
                                    <th class="info-table-head">발생 시간 (Timestamp)</th>
                                    <th class="info-table-head">경도 (Longitude)</th>
                                    <th class="info-table-head">위도 (Latitude)</th>
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
                                    <td class="info-table-cell">{{ event.lng }}</td>
                                    <td class="info-table-cell">{{ event.lat }}</td>
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
const deviceId = ref('');

const rides = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalRides = ref(0);
const ridesPerPage = 10;

const selectedRide = ref(null);
const rideDetail = ref(null);

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString.length < 19) {
        return { date: 'N/A', time: 'N/A' };
    }
    return {
        date: dateTimeString.substring(0, 10),
        time: dateTimeString.substring(11, 19),
    };
};

const fetchRides = async (page) => {
    if (page < 1 || (page > totalPages.value && totalRides.value > 0)) {
        return;
    }

    try {
        currentPage.value = page;
        const params = {
            currentPage: page,
            perPage: ridesPerPage,
            startDate: startDate.value,
            endDate: endDate.value,
        };

        // (★수정★) '/api' 접두사 제거
        const response = await apiClient.post('/trip/selectUserLogs.json', params);

        totalRides.value = response.count;
        totalPages.value = Math.ceil(totalRides.value / ridesPerPage) || 1;

        rides.value = response.result.map((ride) => {
            const startTime = formatDateTime(ride.trip_start_date);
            const endTime = formatDateTime(ride.trip_end_date);

            return {
                date: startTime.date,
                userId: ride.user_id,
                deviceId: ride.trip_id,
                startTime: startTime.time,
                endTime: endTime.time,
                score: ride.final_score,
                helmetOn: ride.helmet_on,
                abruptCount:
                    (ride.abrupt_start_count || 0) +
                    (ride.abrupt_end_count || 0) +
                    (ride.abrupt_accel_count || 0) +
                    (ride.abrupt_decel_count || 0) +
                    (ride.abrupt_noslow_count || 0),
            };
        });
    } catch (error) {
        console.error('과거 운행 목록 조회 실패:', error);
        rides.value = [];
        totalRides.value = 0;
        totalPages.value = 1;
    }
};

const openRideDetail = async (ride) => {
    selectedRide.value = ride;
    rideDetail.value = null;

    try {
        // (★수정★) '/api' 접두사 제거
        const response = await apiClient.post('/trip/selectTripLogDetail.json', {
            trip_id: ride.deviceId,
        });

        const gpsEvents = response.map((gps) => ({
            time: gps.timestamp,
            lat: gps.latitude,
            lng: gps.longitude,
        }));

        rideDetail.value = {
            ...ride,
            events: gpsEvents,
        };
    } catch (error) {
        console.error('운행 상세 정보 조회 실패:', error);
        alert('상세 정보 로딩에 실패했습니다.');
        selectedRide.value = null;
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
