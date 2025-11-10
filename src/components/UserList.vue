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
                <div class="user-id">{{ user.id }}</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">운행 시작</span>
                        <span class="info-value">{{ user.startTime }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">운행 종료</span>
                        <span class="info-value">{{ user.endTime }}</span>
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
import { ref, computed, watch } from 'vue';
// (★수정★) 올바른 상대 경로로 변경 (../ui/ -> ./ui/)
import InfoInput from './ui/InfoInput.vue';
import InfoButton from './ui/InfoButton.vue';

const props = defineProps({
    users: {
        type: Array,
        required: true,
    },
});

// (★추가★) 검색 및 페이지네이션 상태
const searchTerm = ref('');
const currentPage = ref(1);
const usersPerPage = 5; // 한 페이지에 5명씩 표시

// (★추가★) 부모 props가 바뀌면(데이터 새로고침) 1페이지로 리셋
watch(
    () => props.users,
    () => {
        currentPage.value = 1;
    }
);

// (★추가★) 1. 검색어로 사용자 필터링
const filteredUsers = computed(() => {
    if (!searchTerm.value) {
        return props.users;
    }
    return props.users.filter((user) => user.id.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

// (★추가★) 2. 필터링된 결과로 총 페이지 수 계산
const totalUsers = computed(() => filteredUsers.value.length);
const totalPages = computed(() => Math.ceil(totalUsers.value / usersPerPage) || 1);

// (★추가★) 3. 현재 페이지에 표시할 사용자 목록 계산
const paginatedUsers = computed(() => {
    // 페이지가 바뀌면 검색 결과도 리셋 (사용자 경험 개선)
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
    }

    const start = (currentPage.value - 1) * usersPerPage;
    const end = start + usersPerPage;
    return filteredUsers.value.slice(start, end);
});

// (★추가★) 페이지 이동 함수
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

// (기존) 점수 색상 계산
const getScoreColor = (score) => {
    if (score >= 81) return 'high';
    if (score >= 61) return 'mid';
    if (score >= 21) return 'low';
    return 'danger';
};
</script>

<style scoped src="@/assets/styles/components/UserList.css"></style>
