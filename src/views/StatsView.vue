<template>
    <div class="stats-container">
        <div class="stats-header">
            <div class="filter-controls">
                <div class="filter-item">
                    <label class="filter-label">시작일</label>
                    <InfoInput type="date" v-model="startDate" />
                </div>
                <div class="filter-item">
                    <label class="filter-label">종료일</label>
                    <InfoInput type="date" v-model="endDate" />
                </div>
                <InfoButton variant="default" @click="fetchAllStatsData">
                    <template #icon><v-icon name="bi-search" /></template>
                    조회
                </InfoButton>
            </div>
        </div>

        <section class="kpi-grid-4">
            <StatsKpiCard
                title="누적 이용자 수"
                :value="kpiData.users.value"
                :unit="kpiData.users.unit"
                icon="bi-people"
                iconBgColor="bg-blue-100"
            />
            <StatsKpiCard
                title="누적 운행거리"
                :value="kpiData.distance.value"
                :unit="kpiData.distance.unit"
                icon="bi-cursor"
                iconBgColor="bg-cyan-100"
            />
            <StatsKpiCard
                title="누적 운행 수"
                :value="kpiData.rides.value"
                :unit="kpiData.rides.unit"
                icon="bi-activity"
                iconBgColor="bg-indigo-100"
            />
            <StatsKpiCard
                title="누적 발생 위험 행동 수"
                :value="kpiData.risks.value"
                :unit="kpiData.risks.unit"
                icon="bi-exclamation-triangle"
                iconBgColor="bg-red-100"
            />
        </section>

        <section class="kpi-grid-3">
            <StatsKpiCard
                title="평균 위험항목 발생율"
                :value="kpiData.riskRate.value"
                :unit="kpiData.riskRate.unit"
                icon="bi-graph-up"
                iconBgColor="bg-orange-100"
            />
            <StatsKpiCard
                title="평균 안전모 착용율"
                :value="kpiData.helmetRate.value"
                :unit="kpiData.helmetRate.unit"
                icon="bi-shield-check"
                iconBgColor="bg-green-100"
            />
            <StatsKpiCard
                title="평균 안전운행 점수"
                :value="kpiData.safetyScore.value"
                :unit="kpiData.safetyScore.unit"
                icon="bi-award"
                iconBgColor="bg-purple-100"
            />
        </section>

        <section class="trend-section">
            <StatCard title="핵심 지표(KPI) 트렌드">
                <div class="chart-wrapper" style="height: 280px">
                    <LineChart :chartData="kpiTrendChartData" :chartOptions="kpiTrendChartOptions" />
                </div>
            </StatCard>
        </section>

        <section class="stats-main-grid">
            <StatCard title="위험 행동 유형별 통계">
                <template #action>
                    <InfoButton variant="default" size="sm" @click="showRiskTable = !showRiskTable">
                        <template #icon><v-icon name="bi-file-earmark-text" /></template>
                        {{ showRiskTable ? '차트 보기' : '발생빈도 표' }}
                    </InfoButton>
                </template>
                <div v-if="!showRiskTable" class="chart-content-wrapper-horizontal">
                    <div class="chart-wrapper-pie">
                        <PieChart :chartData="riskTypeChartData" :chartOptions="riskTypeChartOptions" />
                    </div>
                    <div class="legend-wrapper">
                        <div v-for="item in riskTypeData" :key="item.name" class="legend-item">
                            <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                            <span class="legend-label">{{ item.name }}</span>
                            <span class="legend-value">{{ item.value }}%</span>
                        </div>
                    </div>
                </div>
                <div v-else class="table-content-wrapper">
                    <div class="info-table-wrapper" style="max-height: 280px; overflow-y: auto">
                        <table class="info-table">
                            <thead class="info-table-header">
                                <tr>
                                    <th class="info-table-head">위험 행동 유형</th>
                                    <th class="info-table-head">발생 건수</th>
                                    <th class="info-table-head">비율</th>
                                </tr>
                            </thead>
                            <tbody class="info-table-body">
                                <tr v-for="item in riskTypeData" :key="item.name" class="info-table-row">
                                    <td class="info-table-cell">
                                        <div class="legend-item">
                                            <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                                            <span class="legend-label">{{ item.name }}</span>
                                        </div>
                                    </td>
                                    <td class="info-table-cell">{{ item.count }}건</td>
                                    <td class="info-table-cell">{{ item.value }}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </StatCard>

            <StatCard title="Top 5 위험 지역 분석">
                <div class="info-table-wrapper" style="max-height: 288px; overflow-y: auto">
                    <table class="info-table">
                        <thead class="info-table-header">
                            <tr>
                                <th class="info-table-head" style="width: 60px; text-align: center">순위</th>
                                <th class="info-table-head">지역명</th>
                                <th class="info-table-head" style="text-align: right">발생 건수</th>
                            </tr>
                        </thead>
                        <tbody class="info-table-body">
                            <tr v-for="item in topRegionsData" :key="item.regionName" class="info-table-row">
                                <td class="info-table-cell" style="text-align: center; font-weight: 600">
                                    {{ item.rank }}
                                </td>
                                <td class="info-table-cell">{{ item.regionName }}</td>
                                <td class="info-table-cell" style="text-align: right; font-weight: 600">
                                    {{ item.count }} 건
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </StatCard>

            <StatCard title="시간대별 위험도 분석">
                <div class="chart-wrapper" style="height: 240px">
                    <BarChart :chartData="timeRiskChartData" :chartOptions="timeRiskChartOptions" />
                </div>
            </StatCard>

            <StatCard title="사용자 그룹별 비교">
                <div class="chart-wrapper" style="height: 240px">
                    <BarChart :chartData="userGroupChartData" :chartOptions="userGroupChartOptions" />
                </div>
            </StatCard>

            <StatCard title="지역별 안전 점수 평균">
                <div class="info-table-wrapper" style="max-height: 280px; overflow-y: auto">
                    <table class="info-table">
                        <thead class="info-table-header">
                            <tr>
                                <th class="info-table-head">지역</th>
                                <th class="info-table-head">평균 안전 점수</th>
                                <th class="info-table-head">추이</th>
                                <th class="info-table-head" style="text-align: right">점수 막대</th>
                            </tr>
                        </thead>
                        <tbody class="info-table-body">
                            <tr v-for="item in regionData" :key="item.region" class="info-table-row">
                                <td class="info-table-cell">{{ item.region }}</td>
                                <td class="info-table-cell">{{ item.score }}점</td>
                                <td class="info-table-cell">
                                    <InfoBadge :variant="item.trend.startsWith('+') ? 'default' : 'destructive'">
                                        {{ item.trend }}
                                    </InfoBadge>
                                </td>
                                <td class="info-table-cell" style="text-align: right">
                                    <div class="progress-bar-container-stats">
                                        <div
                                            class="progress-bar-stats"
                                            :style="{ width: `${item.score}%`, backgroundColor: '#3B82F6' }"
                                        ></div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </StatCard>

            <StatCard title="안전 점수 분포">
                <div class="chart-wrapper" style="height: 280px">
                    <BarChart :chartData="safetyScoreChartData" :chartOptions="safetyScoreChartOptions" />
                </div>
            </StatCard>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api/index.js'; // (★추가★)
import StatsKpiCard from '@/components/StatsKpiCard.vue';
import StatCard from '@/components/StatCard.vue';
import InfoInput from '@/components/ui/InfoInput.vue';
import InfoButton from '@/components/ui/InfoButton.vue';
import InfoBadge from '@/components/ui/InfoBadge.vue';
import LineChart from '@/components/charts/LineChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
import PieChart from '@/components/charts/PieChart.vue';

// --- 기간 필터 상태 ---
const getToday = () => new Date().toISOString().split('T')[0];
const getPastDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};
const startDate = ref(getPastDate(30)); // 기본 30일 전
const endDate = ref(getToday()); // 오늘
const showRiskTable = ref(false);

// (★신규★) API 호출 파라미터용
const apiParams = computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
}));

// --- (★수정★) 모든 데이터를 API 응답을 받을 ref로 변경 (초기값: '...') ---
const kpiData = ref({
    users: { value: '...', unit: '명' },
    distance: { value: '...', unit: 'km' },
    rides: { value: '...', unit: '건' },
    risks: { value: '...', unit: '건' },
    riskRate: { value: '...', unit: '%' },
    helmetRate: { value: '...', unit: '%' },
    safetyScore: { value: '...', unit: '점' },
});

const kpiTrendData = ref({ labels: [], datasets: { rideCounts: [], helmetRates: [], riskCounts: [] } });
const riskTypeData = ref([]);
const userGroupData = ref([]); // (★수정★)
const timeRiskData = ref({ labels: [], data: [] });
const safetyScoreDistribution = ref({ labels: [], data: [] });
const regionData = ref([]); // (★수정★)
const topRegionsData = ref([]);

// --- (★신규★) API 호출 함수들 ---

// 7개 KPI 데이터
const fetchKpiData = async () => {
    try {
        const params = apiParams.value;
        const [kpiResponse, scoreResponse, trendResponse] = await Promise.all([
            apiClient.get('/admin/stats/kpis', { params }),
            apiClient.get('/admin/stats/safety-scores', { params }),
            apiClient.get('/admin/stats/kpi-trends', { params: { ...params, interval: 'daily' } }),
        ]);

        kpiData.value.users.value = (kpiResponse.totalUserCount || 0).toLocaleString();
        kpiData.value.distance.value = (kpiResponse.totalDistance || 0).toLocaleString();
        kpiData.value.risks.value = (kpiResponse.totalRiskCount || 0).toLocaleString();
        kpiData.value.helmetRate.value = (kpiResponse.helmetRate || 0).toFixed(1);
        kpiData.value.safetyScore.value = (scoreResponse.averageScore || 0).toFixed(1);

        // (누적 운행 수: kpi-trends 응답의 rideCounts 배열의 합)
        const totalRides = trendResponse.datasets.rideCounts.reduce((a, b) => a + b, 0);
        kpiData.value.rides.value = totalRides.toLocaleString();

        // (평균 위험항목 발생율: totalRiskCount / totalRides)
        if (totalRides > 0) {
            kpiData.value.riskRate.value = ((kpiResponse.totalRiskCount / totalRides) * 100).toFixed(1);
        } else {
            kpiData.value.riskRate.value = '0';
        }
    } catch (error) {
        console.error('KPI 데이터 로딩 실패:', error);
        // 에러 시 '...' 유지
    }
};

// KPI 트렌드 (LineChart)
const fetchKpiTrends = async () => {
    try {
        const response = await apiClient.get('/admin/stats/kpi-trends', {
            params: { ...apiParams.value, interval: 'daily' },
        });
        kpiTrendData.value = response;
    } catch (error) {
        console.error('KPI 트렌드 데이터 로딩 실패:', error);
        kpiTrendData.value = { labels: [], datasets: { rideCounts: [], helmetRates: [], riskCounts: [] } };
    }
};

// 위험 행동 유형 (PieChart)
const riskColors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
const fetchRiskTypes = async () => {
    try {
        const response = await apiClient.get('/admin/stats/risk-types', { params: apiParams.value });
        riskTypeData.value = response.data.map((item, index) => ({
            name: item.kpiName,
            value: item.percentage, // 파이 차트용 %
            count: item.count, // 테이블용 건수
            color: riskColors[index % riskColors.length],
        }));
    } catch (error) {
        console.error('위험 행동 유형 데이터 로딩 실패:', error);
        riskTypeData.value = [];
    }
};

// Top 5 위험 지역 (Table)
const fetchTopRegions = async () => {
    try {
        const response = await apiClient.get('/admin/stats/top-risk-regions', { params: apiParams.value });
        topRegionsData.value = response.regions;
    } catch (error) {
        console.error('Top 위험 지역 데이터 로딩 실패:', error);
        topRegionsData.value = [];
    }
};

// 시간대별 위험도 (BarChart)
const fetchHourlyRisk = async () => {
    try {
        const response = await apiClient.get('/admin/stats/hourly-risk', { params: apiParams.value });
        timeRiskData.value = response;
    } catch (error) {
        console.error('시간대별 위험도 데이터 로딩 실패:', error);
        timeRiskData.value = { labels: [], data: [] };
    }
};

// (★신규★) 사용자 그룹별 비교 (BarChart) - v1.2 API
const fetchUserGroupComparison = async () => {
    try {
        const response = await apiClient.get('/admin/stats/user-group-comparison', { params: apiParams.value });
        userGroupData.value = response.groups; // API 응답 형식: [{ group: '...', 안전점수: 0, 위험행동빈도: 0 }]
    } catch (error) {
        console.error('사용자 그룹 비교 데이터 로딩 실패:', error);
        userGroupData.value = [];
    }
};

// (★신규★) 지역별 안전 점수 (Table) - v1.2 API
const fetchRegionalScores = async () => {
    try {
        const response = await apiClient.get('/admin/stats/regional-scores', { params: apiParams.value });
        regionData.value = response.regions; // API 응답 형식: [{ region: '...', score: 0, trend: '+0' }]
    } catch (error) {
        console.error('지역별 안전 점수 데이터 로딩 실패:', error);
        regionData.value = [];
    }
};

// 안전 점수 분포 (BarChart)
const fetchSafetyScoreDistribution = async () => {
    try {
        const response = await apiClient.get('/admin/stats/safety-scores', { params: apiParams.value });
        const labels = Object.keys(response.distribution);
        const data = Object.values(response.distribution);
        safetyScoreDistribution.value = { labels, data };
    } catch (error) {
        console.error('안전 점수 분포 데이터 로딩 실패:', error);
        safetyScoreDistribution.value = { labels: [], data: [] };
    }
};

// (★수정★) '조회' 버튼 클릭 시 모든 API 호출
const fetchAllStatsData = () => {
    fetchKpiData();
    fetchKpiTrends();
    fetchRiskTypes();
    fetchTopRegions();
    fetchHourlyRisk();
    fetchSafetyScoreDistribution();
    fetchUserGroupComparison(); // (★신규★) v1.2 API 호출
    fetchRegionalScores(); // (★신규★) v1.2 API 호출
};

// --- 차트 데이터 가공 (computed) ---
// (API 응답 ref를 사용하도록 수정)
const kpiTrendChartData = computed(() => ({
    labels: kpiTrendData.value.labels,
    datasets: [
        {
            label: '이용건수',
            data: kpiTrendData.value.datasets.rideCounts,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            yAxisID: 'yLeft',
            tension: 0.3,
        },
        {
            label: '안전모착용률',
            data: kpiTrendData.value.datasets.helmetRates,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            yAxisID: 'yRight',
            tension: 0.3,
        },
        {
            label: '위험행동수',
            data: kpiTrendData.value.datasets.riskCounts,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: false,
            yAxisID: 'yLeft',
            tension: 0.3,
        },
    ],
}));
const kpiTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: { mode: 'index', intersect: false },
    },
    scales: {
        yLeft: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: '건수' },
        },
        yRight: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: '%' },
            grid: { drawOnChartArea: false },
        },
    },
};
const riskTypeChartData = computed(() => ({
    labels: riskTypeData.value.map((d) => d.name),
    datasets: [
        {
            data: riskTypeData.value.map((d) => d.value),
            backgroundColor: riskTypeData.value.map((d) => d.color),
        },
    ],
}));
const riskTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
        legend: { display: false },
    },
};
const timeRiskChartData = computed(() => ({
    labels: timeRiskData.value.labels,
    datasets: [
        {
            label: '위험 행동 수',
            data: timeRiskData.value.data,
            backgroundColor: '#EF4444',
            borderRadius: 4,
        },
    ],
}));
const timeRiskChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
    },
};
// (★수정★) v1.2 API (userGroupData) 사용
const userGroupChartData = computed(() => ({
    labels: userGroupData.value.map((d) => d.group),
    datasets: [
        {
            label: '안전점수',
            data: userGroupData.value.map((d) => d.안전점수),
            backgroundColor: '#3B82F6',
            borderRadius: 4,
        },
    ],
}));
const userGroupChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom' },
    },
};
const safetyScoreChartData = computed(() => ({
    labels: safetyScoreDistribution.value.labels,
    datasets: [
        {
            label: '사용자 수',
            data: safetyScoreDistribution.value.data,
            backgroundColor: '#8B5CF6',
            borderRadius: 4,
        },
    ],
}));
const safetyScoreChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
    },
};

// (★수정★) 마운트 시 모든 API 호출
onMounted(() => {
    fetchAllStatsData();
});
</script>

<style scoped src="@/assets/styles/views/StatsView.css"></style>
