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
// (★수정★) apiClient와 컴포넌트 import 경로 수정
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoDialog from '../ui/InfoDialog.vue';

// --- 검색 필터 ---
const startDate = ref('');
const endDate = ref('');
const userId = ref('');
const deviceId = ref(''); // (★참고★) selectUserLogs 쿼리는 아직 deviceId 검색을 지원하지 않습니다.

// --- 목록 데이터 ---
const rides = ref([]); // 테이블에 표시될 목록
const currentPage = ref(1);
const totalPages = ref(1);
const totalRides = ref(0);
const ridesPerPage = 10;

// --- 상세 다이얼로그 ---
const selectedRide = ref(null); // 다이얼로그 열림/닫힘 상태
const rideDetail = ref(null); // 다이얼로그 상세 데이터

// (★삭제★) Mock 데이터 제거
// const mockRides = [...];
// const mockRideEvents = [...];

/**
 * (★추가★)
 * 날짜/시간 문자열(yyyy-MM-dd HH:mm:ss.S)에서 날짜와 시간을 분리하는 헬퍼 함수
 */
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString.length < 19) {
        return { date: 'N/A', time: 'N/A' };
    }
    return {
        date: dateTimeString.substring(0, 10),
        time: dateTimeString.substring(11, 19),
    };
};

/**
 * (★추가★)
 * 과거 운행 목록을 서버에서 조회하는 함수 (검색 및 페이징)
 */
const fetchRides = async (page) => {
    if (page < 1 || (page > totalPages.value && totalRides.value > 0)) {
        return; // 유효하지 않은 페이지 요청 방지
    }

    try {
        currentPage.value = page;
        const params = {
            currentPage: page,
            perPage: ridesPerPage,
            startDate: startDate.value,
            endDate: endDate.value,
            // (★참고★) trip-SQL.xml의 selectUserLogs는 user_id 검색을 지원하지 않습니다.
            // (추후 쿼리 수정 필요). 우선 userId.value는 무시됩니다.
        };

        // Spring API 호출 (TripController -> /api/trip/selectUserLogs.json)
        const response = await apiClient.post('/api/trip/selectUserLogs.json', params);

        totalRides.value = response.count;
        totalPages.value = Math.ceil(totalRides.value / ridesPerPage) || 1;

        // (★수정★) 백엔드 데이터를 프론트엔드 형식으로 매핑
        rides.value = response.result.map((ride) => {
            const startTime = formatDateTime(ride.trip_start_date);
            const endTime = formatDateTime(ride.trip_end_date);

            return {
                date: startTime.date,
                userId: ride.user_id,
                deviceId: ride.trip_id, // 기기 번호 대신 trip_id를 사용
                startTime: startTime.time,
                endTime: endTime.time,
                score: ride.final_score,
                helmetOn: ride.helmet_on, // 상세조회 시 사용
                // (★추가★) 위험 행동 총합
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

/**
 * (★추가★)
 * 운행 상세 정보(GPS 로그)를 조회하고 다이얼로그를 여는 함수
 */
const openRideDetail = async (ride) => {
    selectedRide.value = ride; // 다이얼로그 먼저 열기 (로딩 표시)
    rideDetail.value = null; // 이전 데이터 초기화

    try {
        // Spring API 호출 (TripController -> /api/trip/selectTripLogDetail.json)
        const response = await apiClient.post('/api/trip/selectTripLogDetail.json', {
            trip_id: ride.deviceId, // ride.deviceId에 trip_id가 저장되어 있음
        });

        // (★수정★) 백엔드 데이터(response.result)를 프론트엔드 형식으로 매핑
        const gpsEvents = response.result.map((gps) => ({
            time: gps.timestamp,
            lat: gps.latitude,
            lng: gps.longitude,
        }));

        // 목록에서 클릭한 ride 정보와 API 응답(gpsEvents)을 조합
        rideDetail.value = {
            ...ride,
            events: gpsEvents,
        };
    } catch (error) {
        console.error('운행 상세 정보 조회 실패:', error);
        alert('상세 정보 로딩에 실패했습니다.');
        selectedRide.value = null; // 오류 발생 시 다이얼로그 닫기
    }
};

/**
 * (★추가★)
 * 다이얼로그를 닫는 함수
 */
const closeDialog = () => {
    selectedRide.value = null;
    rideDetail.value = null;
};

// 컴포넌트가 마운트될 때 첫 페이지 조회
onMounted(() => {
    fetchRides(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
