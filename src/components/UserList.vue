<template>
    <div class="user-list-container">
        <h3 class="card-title">사용자 이용 정보</h3>

        <div class="search-bar-wrapper">
            <InfoInput v-model="searchTerm" placeholder="사용자 ID로 검색..." :hasIcon="true">
                <template #icon><v-icon name="bi-search" /></template>
            </InfoInput>
        </div>

        <ul class="user-list" v-if="paginatedUsers.length > 0">
            <li class="user-item" v-for="user in paginatedUsers" :key="user.id">
                <div class="user-id-wrapper">
                    <span class="info-label">사용자 ID</span>
                    <div class="user-id-value">{{ user.id }}</div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">운행 시작</span>
                        <span class="info-value">{{ user.startTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">경과 시간</span>
                        <span class="info-value">{{ getElapsedTime(user.endTime) }}</span>
                    </div>
                </div>

                <div class="score-wrapper">
                    <span class="score-label">안전운행 점수</span>
                    <div class="score-bar-value-wrapper">
                        <div class="score-bar-container">
                            <div
                                class="score-bar"
                                :class="getScoreColor(user.score)"
                                :style="{ width: user.score + '%' }"
                            ></div>
                        </div>
                        <span :class="['score-value', getScoreColor(user.score)]"> {{ user.score }}점 </span>
                    </div>
                </div>
            </li>
        </ul>
        <div v-else class="loading-text empty-list-text">
            {{ searchTerm ? '검색 결과가 없습니다.' : '실시간 사용자 정보가 없습니다.' }}
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalUsers }}명</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                >
                    이전
                </InfoButton>
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                >
                    다음
                </InfoButton>
            </div>
        </div>
    </div>
</template>

<script setup>
// (★수정★) onMounted, onUnmounted 추가
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import InfoInput from './ui/InfoInput.vue';
import InfoButton from './ui/InfoButton.vue';

const props = defineProps({
    users: {
        type: Array,
        required: true,
    },
});

// --- (★추가★) 경과 시간 계산용 타이머 ---
const now = ref(new Date());
const timer = ref(null);

onMounted(() => {
    // 1초마다 '현재 시간(now)'을 갱신하는 타이머 시작
    timer.value = setInterval(() => {
        now.value = new Date();
    }, 1000);
});

onUnmounted(() => {
    // 컴포넌트 파괴 시 타이머 정리
    if (timer.value) {
        clearInterval(timer.value);
    }
});

/**
 * (★핵심 수정★)
 * 시작 시간(ISO 문자열)을 받아 "XX분 째" 또는 "X시간 XX분 째"로 반환
 */
const getElapsedTime = (startTimeString) => {
    if (!startTimeString) return 'N/A';
    try {
        const start = new Date(startTimeString);
        // now.value (현재시간) - start (시작시간)
        const diffMs = now.value.getTime() - start.getTime();
        if (diffMs < 0) return '0분 째';

        // 1. 총 경과 시간 (분 단위)
        const totalMinutes = Math.floor(diffMs / 60000); // (diffMs / 1000 / 60)

        if (totalMinutes < 60) {
            // 2. 60분 미만: "XX분 째"
            return `${totalMinutes}분 째`;
        } else {
            // 3. 60분 이상: "X시간 XX분 째"
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${hours}시간 ${minutes}분 째`;
        }
    } catch (e) {
        return 'Error';
    }
};
// --- 타이머 로직 끝 ---

// --- (기존) 검색 및 페이지네이션 ---
const searchTerm = ref('');
const currentPage = ref(1);
const usersPerPage = 5;

watch(
    () => props.users,
    () => {
        currentPage.value = 1;
    }
);

const filteredUsers = computed(() => {
    if (!searchTerm.value) {
        return props.users;
    }
    // (★수정★) user.id가 숫자일 수 있으므로 문자열로 변환하여 검색
    return props.users.filter((user) => String(user.id).toLowerCase().includes(searchTerm.value.toLowerCase()));
});

const totalUsers = computed(() => filteredUsers.value.length);
const totalPages = computed(() => Math.ceil(totalUsers.value / usersPerPage) || 1);

const paginatedUsers = computed(() => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
    }
    const start = (currentPage.value - 1) * usersPerPage;
    const end = start + usersPerPage;
    return filteredUsers.value.slice(start, end);
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const getScoreColor = (score) => {
    if (score >= 81) return 'high';
    if (score >= 61) return 'mid';
    if (score >= 21) return 'low';
    return 'danger';
};
</script>

<style scoped src="@/assets/styles/components/UserList.css"></style>
