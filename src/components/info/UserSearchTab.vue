<template>
    <div class="tab-container">
        <div class="search-form">
            <InfoInput v-model="searchTerm" placeholder="사용자 ID, 이름, 연락처로 검색" :hasIcon="true">
                <template #icon><v-icon name="bi-search" /></template>
            </InfoInput>
            <InfoButton variant="default" @click="fetchUsers(1)">검색</InfoButton>
        </div>

        <div class="info-table-wrapper">
            <table class="info-table">
                <thead class="info-table-header">
                    <tr>
                        <th class="info-table-head">사용자 ID</th>
                        <th class="info-table-head">이름 (닉네임)</th>
                        <th class="info-table-head">가입일</th>
                        <th class="info-table-head">평균 안전 점수</th>
                        <th class="info-table-head">역할</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="isLoading">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            사용자 목록을 불러오는 중입니다...
                        </td>
                    </tr>
                    <tr v-else-if="!users || users.length === 0">
                        <td colspan="5" class="info-table-cell" style="text-align: center; height: 100px">
                            조회된 사용자가 없습니다.
                        </td>
                    </tr>
                    <tr
                        v-for="user in users"
                        :key="user.id"
                        class="info-table-row clickable"
                        @click="openUserDetail(user)"
                    >
                        <td class="info-table-cell">{{ user.id }}</td>
                        <td class="info-table-cell">{{ user.name }}</td>
                        <td class="info-table-cell">{{ user.joinDate }}</td>
                        <td class="info-table-cell">{{ user.safetyScore }}점</td>
                        <td class="info-table-cell">{{ user.role }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-controls">
            <p>총 {{ totalUsers }}명의 사용자</p>
            <div class="pagination-buttons">
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchUsers(currentPage - 1)"
                    :disabled="currentPage === 1"
                    >이전</InfoButton
                >
                <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                <InfoButton
                    variant="outline"
                    size="sm"
                    @click="fetchUsers(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    >다음</InfoButton
                >
            </div>
        </div>

        <InfoDialog :open="!!selectedUser" title="사용자 상세 정보" @update:open="closeDialog">
            <div v-if="userDetail">
                <div class="dialog-section">
                    <h3 class="dialog-section-title">기본 정보</h3>
                    <div class="info-grid">
                        <div>
                            <p>사용자 ID</p>
                            <p>{{ userDetail.id }}</p>
                        </div>
                        <div>
                            <p>이름 (닉네임)</p>
                            <p>{{ userDetail.name }}</p>
                        </div>
                        <div>
                            <p>연락처</p>
                            <p>{{ userDetail.phone }}</p>
                        </div>
                        <div>
                            <p>가입일</p>
                            <p>{{ userDetail.joinDate }}</p>
                        </div>
                    </div>
                </div>
                <div class="dialog-section">
                    <h3 class="dialog-section-title">누적 이용 현황 (★Mock Data)</h3>
                    <div class="info-grid">
                        <div>
                            <p>총 이용 횟수</p>
                            <p>{{ userDetail.totalRides }}회</p>
                        </div>
                        <div>
                            <p>총 결제 금액</p>
                            <p>{{ userDetail.totalPayment }}</p>
                        </div>
                    </div>
                </div>
                <div class="dialog-section">
                    <h3 class="dialog-section-title">위험 행동 이력 (★Mock Data)</h3>
                    <div class="info-table-wrapper" style="max-height: 256px; overflow-y: auto">
                        <table class="info-table">
                            <thead class="info-table-header">
                                <tr>
                                    <th class="info-table-head">날짜</th>
                                    <th class="info-table-head">시간</th>
                                    <th class="info-table-head">위험 행동 유형</th>
                                    <th class="info-table-head">조치 내역</th>
                                </tr>
                            </thead>
                            <tbody class="info-table-body">
                                <tr v-for="(record, idx) in userDetail.riskHistory" :key="idx" class="info-table-row">
                                    <td class="info-table-cell">{{ record.date }}</td>
                                    <td class="info-table-cell">{{ record.time }}</td>
                                    <td class="info-table-cell">{{ record.type }}</td>
                                    <td class="info-table-cell">{{ record.action }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div v-else style="min-height: 300px; display: flex; align-items: center; justify-content: center">
                <p>사용자 상세 정보를 불러오는 중입니다...</p>
            </div>
        </InfoDialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
import InfoDialog from '../ui/InfoDialog.vue';

const searchTerm = ref('');
const selectedUser = ref(null);
const userDetail = ref(null);
const isLoading = ref(true);

const users = ref([]);

const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const usersPerPage = 10;

const formatJoinDate = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (e) {
        return 'N/A';
    }
};

const fetchUsers = async (page) => {
    if (page < 1 || (page > totalPages.value && totalUsers.value > 0)) {
        return;
    }

    isLoading.value = true;

    try {
        currentPage.value = page;
        const params = {
            page: page,
            size: usersPerPage,
            searchKeyword: searchTerm.value,
        };

        const response = await apiClient.get('/admin/users', { params });

        totalUsers.value = response.totalCount || 0;
        totalPages.value = Math.ceil(totalUsers.value / usersPerPage) || 1;

        users.value = response.users.map((user) => ({
            id: user.userId,
            name: user.nickname,
            joinDate: formatJoinDate(user.joinDate),
            safetyScore: user.safetyScore,
            role: user.role || 'user',
        }));
    } catch (error) {
        console.error('사용자 목록 조회 실패:', error);
        users.value = [];
        totalUsers.value = 0;
        totalPages.value = 1;
    } finally {
        isLoading.value = false;
    }
};

const openUserDetail = async (user) => {
    selectedUser.value = user;
    userDetail.value = null;

    try {
        const detail = await apiClient.get(`/admin/users/${user.id}`);

        // (★여기가 수정되었습니다★)
        userDetail.value = {
            id: detail.user_id, // ⬅️ detail.userId -> detail.user_id
            name: detail.nickname,
            phone: detail.telno || 'N/A',
            joinDate: formatJoinDate(detail.created_at), // ⬅️ detail.joinDate -> detail.created_at

            // (★유지★) Mock Data (API 명세서에 없는 정보)
            totalRides: 156,
            totalPayment: '₩234,500',
            riskHistory: [
                { date: '2024-10-28', time: '14:32', type: '헬멧 미착용', action: '경고 발송' },
                { date: '2024-10-15', time: '09:15', type: '급가속', action: '주의 알림' },
            ],
        };
    } catch (error) {
        console.error('사용자 상세 정보 조회 실패:', error);
        alert('상세 정보 로딩에 실패했습니다.');
        selectedUser.value = null;
    }
};

const closeDialog = () => {
    selectedUser.value = null;
    userDetail.value = null;
};

onMounted(() => {
    fetchUsers(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
