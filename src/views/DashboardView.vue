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

// 1. KPI 데이터 (초기값)
const kpiData = ref([
    { id: 1, value: '...', label: '누적 이용자 수', changeText: '로딩 중...' },
    { id: 2, value: '...', label: '발생 위험 행동 수', changeText: '로딩 중...' },
    { id: 3, value: '...', label: '안전모 착용률', changeText: '로딩 중...' },
    { id: 4, value: '...', label: '운행거리 합계', changeText: '로딩 중...' },
]);

// 2. 차트 데이터 (초기값)
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
    /* (★수정★)
     * 새 API 명세서의 'GET /api/admin/stats/kpis'를 호출합니다.
     */
    try {
        // (참고: API 명세서에 날짜 파라미터가 있으나, 대시보드는 전체 기간으로 가정)
        const stats = await apiClient.get('/admin/stats/kpis');

        if (stats) {
            kpiData.value = [
                { id: 1, value: `${stats.totalUserCount || 0}명`, label: '누적 이용자 수', changeText: '전체 기간' },
                {
                    id: 2,
                    value: `${stats.totalRiskCount || 0}건`,
                    label: '발생 위험 행동 수',
                    changeText: '전체 기간',
                },
                { id: 3, value: `${stats.helmetRate || 0}%`, label: '안전모 착용률', changeText: '평균' },
                { id: 4, value: `${stats.totalDistance || 0}km`, label: '운행거리 합계', changeText: '전체 기간' },
            ];
        }
    } catch (error) {
        console.error('KPI 데이터 로딩 실패:', error);
        kpiData.value = kpiData.value.map((k) => ({ ...k, value: '오류', changeText: '로드 실패' }));
    }
};

// 2. 차트 데이터 로드
const fetchChartData = async () => {
    /* (★수정★)
     * 새 API 명세서 v1.2에 맞는 API를 호출합니다.
     */
    try {
        // (1) '월별 평균 안전 점수' (LineChart)
        // (★수정★) v1.2 명세서의 'GET /api/admin/stats/monthly-safety-scores' 호출
        const scoreResponse = await apiClient.get('/admin/stats/monthly-safety-scores', {
            // (참고: 필요 시 params로 날짜 범위 전송)
        });

        if (scoreResponse && scoreResponse.labels && scoreResponse.data) {
            chartData.value.helmet.data = {
                labels: scoreResponse.labels,
                datasets: [
                    {
                        data: scoreResponse.data,
                    },
                ],
            };
        }

        // (2) '시간대별 총 위험 행동' (LineChart)
        // (참고: `GET /api/admin/stats/hourly-risk` API를 호출합니다.)
        const hourlyResponse = await apiClient.get('/admin/stats/hourly-risk');

        if (hourlyResponse && hourlyResponse.labels && hourlyResponse.data) {
            chartData.value.road.data = {
                labels: hourlyResponse.labels,
                datasets: [
                    {
                        data: hourlyResponse.data,
                        // (LineChart.vue 기본 옵션이 파란색 영역형 차트임)
                    },
                ],
            };
        }
    } catch (error) {
        console.error('차트 데이터 로딩 실패:', error);
        chartData.value.helmet.data = null;
        chartData.value.road.data = null;
    }
};

onMounted(async () => {
    fetchKpiData();
    fetchChartData();
});
</script>

<style scoped src="@/assets/styles/views/DashboardView.css"></style>
