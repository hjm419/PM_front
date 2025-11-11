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
                <InfoButton variant="default" @click="fetchKpiData">
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
                            <tr v-for="(item, index) in topRegionsData" :key="item.region" class="info-table-row">
                                <td class="info-table-cell" style="text-align: center; font-weight: 600">
                                    {{ index + 1 }}
                                </td>
                                <td class="info-table-cell">{{ item.region }}</td>
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
import StatsKpiCard from '@/components/StatsKpiCard.vue';
import StatCard from '@/components/StatCard.vue';
// (★핵심 수정★) InfoSelect -> InfoInput
import InfoInput from '@/components/ui/InfoInput.vue';
import InfoButton from '@/components/ui/InfoButton.vue';
import InfoBadge from '@/components/ui/InfoBadge.vue';
import LineChart from '@/components/charts/LineChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
import PieChart from '@/components/charts/PieChart.vue';

// --- 기간 필터 상태 ---
const startDate = ref('2025-11-01');
const endDate = ref('2025-11-05');
const showRiskTable = ref(false);

// (★삭제★) periodFilter, periodOptions 제거

// --- 7개 KPI 데이터를 ref로 변경 ---
const kpiData = ref({
    users: { value: '12,847', unit: '명' },
    distance: { value: '45,382', unit: 'km' },
    rides: { value: '5,650', unit: '건' },
    risks: { value: '490', unit: '건' },
    riskRate: { value: '8.7', unit: '%' },
    helmetRate: { value: '91', unit: '%' },
    safetyScore: { value: '86.5', unit: '점' },
});

// --- KPI 데이터 조회 함수 ---
const fetchKpiData = () => {
    console.log('KPI 데이터 조회 시도:', startDate.value, '~', endDate.value);
    // (임시) Mock 데이터 변경
    kpiData.value.users.value = (12847 + Math.floor(Math.random() * 100)).toLocaleString();
    kpiData.value.risks.value = (490 + Math.floor(Math.random() * 20 - 10)).toString();
};

// --- (이하 나머지 데이터는 이전과 동일) ---
const riskTypeData = [
    { name: '안전모 미착용', value: 30, color: '#EF4444', count: 147 },
    { name: '급출발', value: 18, color: '#F59E0B', count: 88 },
    { name: '급정지', value: 20, color: '#3B82F6', count: 98 },
    { name: '급가속', value: 15, color: '#8B5CF6', count: 74 },
    { name: '급감속', value: 10, color: '#EC4899', count: 49 },
    { name: '급회전', value: 7, color: '#14B8A6', count: 34 },
];
const kpiTrendData = [
    { date: '11/1', 이용건수: 980, 안전모착용률: 85, 위험행동수: 28 },
    { date: '11/2', 이용건수: 1150, 안전모착용률: 88, 위험행동수: 24 },
    { date: '11/3', 이용건수: 1050, 안전모착용률: 91, 위험행동수: 19 },
    { date: '11/4', 이용건수: 1280, 안전모착용률: 89, 위험행동수: 22 },
    { date: '11/5', 이용건수: 1420, 안전모착용률: 92, 위험행동수: 18 },
];
const userGroupData = [
    { group: '신규 사용자', 안전점수: 65, 위험행동빈도: 8.5 },
    { group: '10회 이상', 안전점수: 78, 위험행동빈도: 5.2 },
    { group: '100회 이상', 안전점수: 89, 위험행동빈도: 2.1 },
];
const timeRiskData = [
    { time: '출근길(08-10)', count: 85 },
    { time: '점심(12-14)', count: 52 },
    { time: '퇴근길(18-20)', count: 128 },
    { time: '심야(22-00)', count: 45 },
];
const safetyScoreDistribution = [
    { range: '0-20', count: 12 },
    { range: '21-40', count: 35 },
    { range: '41-60', count: 89 },
    { range: '61-80', count: 156 },
    { range: '81-100', count: 208 },
];
const regionData = [
    { region: '양호동', score: 88, trend: '+3' },
    { region: '신평동', score: 85, trend: '+1' },
    { region: '형곡동', score: 82, trend: '-2' },
    { region: '진미동', score: 79, trend: '+5' },
    { region: '공단동', score: 76, trend: '-1' },
];
const topRegionsData = [
    { region: '영남대역 3번 출구', count: 58 },
    { region: '경산시청 사거리', count: 42 },
    { region: '백천동 상가 밀집구역', count: 31 },
    { region: '옥곡동 네거리', count: 25 },
    { region: '진량읍 행정복지센터 앞', count: 19 },
];

// --- 차트 데이터 가공 (이전과 동일) ---
const kpiTrendChartData = computed(() => ({
    labels: kpiTrendData.map((d) => d.date),
    datasets: [
        {
            label: '이용건수',
            data: kpiTrendData.map((d) => d.이용건수),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            yAxisID: 'yLeft',
            tension: 0.3,
        },
        {
            label: '안전모착용률',
            data: kpiTrendData.map((d) => d.안전모착용률),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            yAxisID: 'yRight',
            tension: 0.3,
        },
        {
            label: '위험행동수',
            data: kpiTrendData.map((d) => d.위험행동수),
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
    labels: riskTypeData.map((d) => d.name),
    datasets: [
        {
            data: riskTypeData.map((d) => d.value),
            backgroundColor: riskTypeData.map((d) => d.color),
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
    labels: timeRiskData.map((d) => d.time),
    datasets: [
        {
            label: '위험 행동 수',
            data: timeRiskData.map((d) => d.count),
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
const userGroupChartData = computed(() => ({
    labels: userGroupData.map((d) => d.group),
    datasets: [
        {
            label: '안전점수',
            data: userGroupData.map((d) => d.안전점수),
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
    labels: safetyScoreDistribution.map((d) => d.range),
    datasets: [
        {
            label: '사용자 수',
            data: safetyScoreDistribution.map((d) => d.count),
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
const topRegionsChartData = computed(() => ({
    labels: topRegionsData.map((d) => d.region),
    datasets: [
        {
            label: '위험 발생 건수',
            data: topRegionsData.map((d) => d.count),
            backgroundColor: '#F97316',
            borderRadius: 4,
        },
    ],
}));
const topRegionsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
        legend: { display: false },
    },
    scales: {
        y: {
            ticks: {
                font: { size: 10 },
            },
        },
    },
};

onMounted(() => {
    fetchKpiData();
});
</script>

<style scoped src="@/assets/styles/views/StatsView.css"></style>
