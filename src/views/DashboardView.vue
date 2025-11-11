<template>
    <div class="dashboard-container">
        <section class="kpi-grid">
            <KpiCard
                v-for="kpi in kpiData"
                :key="kpi.id"
                :cardId="kpi.id"
                :value="kpi.value"
                :label="kpi.label"
                :changeText="kpi.changeText"
            />
        </section>

        <section class="main-grid">
            <MapInfo :pm-data="pmData" :pm-stats="pmStats" />
        </section>

        <section class="bottom-grid">
            <div class="chart-section-card">
                <h3 class="section-title">법규 준수율 (백엔드 연동 샘플)</h3>

                <div class="chart-grid">
                    <ChartCard :title="chartData.helmet.title" :chartData="chartData.helmet.data" />
                    <ChartCard
                        :title="chartData.road.title"
                        :chartData="chartData.road.data"
                        :chartOptions="chartData.road.options"
                    />
                </div>
            </div>

            <UserAnalysis />
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import KpiCard from '@/components/KpiCard.vue';
import MapInfo from '@/components/MapInfo.vue';
import ChartCard from '@/components/ChartCard.vue';
import UserAnalysis from '@/components/UserAnalysis.vue';

// 1. KPI 데이터
const kpiData = ref([
    { id: 1, value: '...', label: '누적 이용자 수', changeText: '로딩 중...' },
    { id: 2, value: '...', label: '발생 위험 행동 수', changeText: '로딩 중...' },
    { id: 3, value: '...', label: '안전모 착용률', changeText: '로딩 중...' },
    { id: 4, value: '...', label: '운행거리 합계', changeText: '로딩 중...' },
]);

// 2. 차트 데이터
const chartData = ref({
    helmet: { title: '월별 평균 안전 점수', data: null },
    road: { title: '시간대별 총 위험 행동', data: null, options: {} },
});

// 3. 지도 데이터 (임시)
const pmData = ref([
    { id: 'PM-101', score: 95, lat: 35.8244, lng: 128.738, status: '운행중' },
    { id: 'PM-102', score: 42, lat: 35.825, lng: 128.739, status: '배터리 부족' },
    { id: 'PM-103', score: 15, lat: 35.8235, lng: 128.737, status: '고장' },
]);
const pmStats = ref({ total: 3, running: 1, error: 1, lowBattery: 1 });

// --- API 호출 함수 ---

// 1. KPI 데이터 로드
const fetchKpiData = async () => {
    try {
        // (★수정★) '/api' 접두사 제거
        const response = await apiClient.post('/trip/selectAvgStats.json', {});

        if (response) {
            const stats = response;
            kpiData.value = [
                { id: 1, value: `${stats.total_user_count || 0}명`, label: '누적 이용자 수', changeText: '전체 기간' },
                {
                    id: 2,
                    value: `${stats.total_abrupt_count || 0}건`,
                    label: '발생 위험 행동 수',
                    changeText: '전체 기간',
                },
                { id: 3, value: `${stats.avg_helmet_on || 0}%`, label: '안전모 착용률', changeText: '평균' },
                { id: 4, value: `${stats.total_distance || 0}km`, label: '운행거리 합계', changeText: '전체 기간' },
            ];
        }
    } catch (error) {
        console.error('KPI 데이터 로딩 실패:', error);
        kpiData.value = kpiData.value.map((k) => ({ ...k, value: '오류', changeText: '로드 실패' }));
    }
};

// 2. 차트 데이터 로드
const fetchChartData = async () => {
    try {
        // (★수정★) '/api' 접두사 제거
        const scoreResponse = await apiClient.post('/trip/selectMonthlyAvgScore.json');

        if (scoreResponse) {
            chartData.value.helmet.data = {
                labels: scoreResponse.map((item) => item.month),
                datasets: [
                    {
                        data: scoreResponse.map((item) => item.avg_score),
                    },
                ],
            };
        }

        // (★수정★) '/api' 접두사 제거
        const hourlyResponse = await apiClient.post('/trip/selectTripHour.json', {});

        if (hourlyResponse) {
            const hours = Array.from({ length: 24 }, (_, i) => i);
            const abruptCounts = Array(24).fill(0);

            hourlyResponse.forEach((item) => {
                abruptCounts[item.trip_hour] = item.total_abrupt_count;
            });

            chartData.value.road.data = {
                labels: hours.map((h) => `${h}시`),
                datasets: [
                    {
                        data: abruptCounts,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: '#ef4444',
                        fill: true,
                    },
                ],
            };
        }
    } catch (error) {
        console.error('차트 데이터 로딩 실패:', error);
    }
};

onMounted(async () => {
    fetchKpiData();
    fetchChartData();
});
</script>

<style scoped src="@/assets/styles/views/DashboardView.css"></style>
