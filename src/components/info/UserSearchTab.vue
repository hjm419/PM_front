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
                        <th class="info-table-head">이름</th>
                        <th class="info-table-head">가입일</th>
                        <th class="info-table-head">평균 안전 점수</th>
                        <th class="info-table-head">상태</th>
                    </tr>
                </thead>
                <tbody class="info-table-body">
                    <tr v-if="users.length === 0">
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
                        <td class="info-table-cell">
                            <InfoBadge :variant="user.status === '정상' ? 'default' : 'destructive'">
                                {{ user.status }}
                            </InfoBadge>
                        </td>
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
                            <p>이름</p>
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
                <div class="dialog-section action-buttons">
                    <InfoButton variant="outline">경고 메시지 전송</InfoButton>
                    <InfoButton variant="outline">페널티 부여</InfoButton>
                    <InfoButton variant="destructive" class="ml-auto"> 계정 이용 정지 </InfoButton>
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
// (★수정★) apiClient와 컴포넌트 import 경로 수정
import apiClient from '@/api/index.js';
import InfoInput from '../ui/InfoInput.vue';
import InfoButton from '../ui/InfoButton.vue';
import InfoBadge from '../ui/InfoBadge.vue';
import InfoDialog from '../ui/InfoDialog.vue';

const searchTerm = ref('');
const selectedUser = ref(null); // 다이얼로그 열림/닫힘 상태
const userDetail = ref(null); // 다이얼로그에 표시될 상세 데이터

// (★추가★) API에서 받아올 사용자 목록
const users = ref([]);

// (★추가★) 페이지네이션 상태
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const usersPerPage = 10; // 페이지 당 10개씩

// (★삭제★) Mock 데이터 제거
// const mockUsers = [...];
// const mockUserDetail = { ... };

/**
 * (★추가★)
 * 사용자 목록을 서버에서 조회하는 함수 (검색 및 페이징)
 */
const fetchUsers = async (page) => {
    if (page < 1 || (page > totalPages.value && totalUsers.value > 0)) {
        return; // 유효하지 않은 페이지 요청 방지
    }

    try {
        currentPage.value = page;
        const params = {
            currentPage: page,
            perPage: usersPerPage,
            // (참고) user-SQL.xml에서 searchType: 'all'을 지원합니다.
            searchType: 'all',
            searchText: searchTerm.value,
        };

        // Spring API 호출 (UserController -> /userSelectList.json)
        const response = await apiClient.post('/userSelectList.json', params);

        totalUsers.value = response.userSelectListCount;
        totalPages.value = Math.ceil(totalUsers.value / usersPerPage) || 1;

        // (★수정★) 백엔드 데이터를 프론트엔드 형식으로 매핑
        users.value = response.userSelectList.map((user) => ({
            id: user.user_id,
            name: user.user_name,
            joinDate: user.reg_dt ? user.reg_dt.split(' ')[0] : 'N/A', // 날짜 부분만 추출
            // (★참고★) 'safetyScore'는 userSelectList 쿼리에 없으므로 임시 값 사용
            safetyScore: 99,
            // (★참고★) 'status'는 user.user_auth 값을 기반으로 임시 처리
            status: user.user_auth === 'admin' ? '관리자' : '정상',
        }));
    } catch (error) {
        console.error('사용자 목록 조회 실패:', error);
        users.value = [];
        totalUsers.value = 0;
        totalPages.value = 1;
    }
};

/**
 * (★추가★)
 * 사용자 상세 정보를 조회하고 다이얼로그를 여는 함수
 */
const openUserDetail = async (user) => {
    selectedUser.value = user; // 다이얼로그 먼저 열기 (로딩 표시)
    userDetail.value = null; // 이전 데이터 초기화

    try {
        // Spring API 호출 (UserController -> /userSelectOne.json)
        const response = await apiClient.post('/userSelectOne.json', { user_id: user.id });
        const detail = response.result;

        // (★수정★) 백엔드 데이터(detail)와 목록 데이터(user)를 조합
        userDetail.value = {
            id: detail.user_id,
            name: detail.user_name,
            phone: detail.user_telno,
            joinDate: user.joinDate, // 목록에 있던 가입일 사용

            // (★참고★) 아래 3개 항목은 /userSelectOne.json API에 없으므로 Mock 데이터 사용
            // (추후 백엔드 구현 필요)
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
        selectedUser.value = null; // 오류 발생 시 다이얼로그 닫기
    }
};

/**
 * (★추가★)
 * 다이얼로그를 닫는 함수
 */
const closeDialog = () => {
    selectedUser.value = null;
    userDetail.value = null;
};

// 컴포넌트가 마운트될 때 첫 페이지 조회
onMounted(() => {
    fetchUsers(1);
});
</script>

<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
