<template>
    <div class="profile-container">
        <div class="profile-grid">
            <div class="profile-card">
                <h3 class="card-title">기본 계정 정보</h3>
                <form class="profile-form" @submit.prevent="saveProfile">
                    <div class="form-group">
                        <label class="profile-label" for="adminId">관리자 아이디</label>
                        <input id="adminId" v-model="adminId" type="text" class="profile-input" readonly />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="adminName">관리자 이름</label>
                        <input id="adminName" v-model="adminName" type="text" class="profile-input" required />
                    </div>

                    <div class="form-group">
                        <label class="profile-label" for="adminPhone">휴대폰 번호</label>
                        <input
                            id="adminPhone"
                            v-model="adminPhone"
                            type="tel"
                            class="profile-input"
                            placeholder="010-0000-0000"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="adminEmail">이메일</label>
                        <input
                            id="adminEmail"
                            v-model="adminEmail"
                            type="email"
                            class="profile-input"
                            placeholder="admin@company.com"
                            required
                        />
                    </div>

                    <button type="submit" class="profile-button">변경사항 저장</button>
                </form>
            </div>

            <div class="profile-card">
                <h3 class="card-title">보안 설정</h3>
                <form class="profile-form" @submit.prevent="changePassword">
                    <div class="form-group">
                        <label class="profile-label" for="currentPw">현재 비밀번호</label>
                        <input id="currentPw" v-model="currentPw" type="password" class="profile-input" required />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="newPw">새 비밀번호</label>
                        <input id="newPw" v-model="newPw" type="password" class="profile-input" required />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="confirmPw">새 비밀번호 확인</label>
                        <input id="confirmPw" v-model="confirmPw" type="password" class="profile-input" required />
                    </div>
                    <button type="submit" class="profile-button">비밀번호 변경</button>
                </form>
            </div>

            <div class="profile-card full-width">
                <h3 class="card-title">내 활동 로그 (★Mock Data)</h3>
                <div class="log-filter-form">
                    <div class="log-filter-grid">
                        <div>
                            <label class="profile-label">시작일</label>
                            <InfoInput type="date" v-model="startDate" />
                        </div>
                        <div>
                            <label class="profile-label">종료일</label>
                            <InfoInput type="date" v-model="endDate" />
                        </div>
                        <div>
                            <label class="profile-label">검색어</label>
                            <InfoInput placeholder="상세 내용으로 검색" v-model="logSearchTerm" />
                        </div>
                    </div>
                    <InfoButton variant="default" @click="handleLogSearch">
                        <template #icon><v-icon name="bi-search" class="icon" /></template>
                        로그 검색
                    </InfoButton>
                </div>
                <div class="profile-table-wrapper">
                    <table class="profile-table">
                        <thead class="profile-table-header">
                            <tr>
                                <th class="profile-table-head">시간</th>
                                <th class="profile-table-head">작업 유형</th>
                                <th class="profile-table-head">상세 내용</th>
                            </tr>
                        </thead>
                        <tbody class="profile-table-body">
                            <tr v-if="logs.length === 0">
                                <td colspan="3" class="profile-table-cell text-center">조회된 로그가 없습니다.</td>
                            </tr>
                            <tr v-for="(log, idx) in logs" :key="idx" class="profile-table-row">
                                <td class="profile-table-cell">{{ log.time }}</td>
                                <td class="profile-table-cell">{{ log.type }}</td>
                                <td class="profile-table-cell">{{ log.detail }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="pagination-controls">
                    <p>총 {{ totalLogs }}개의 로그</p>
                    <div class="pagination-buttons">
                        <InfoButton
                            variant="outline"
                            size="sm"
                            @click="fetchLogs(currentPage - 1)"
                            :disabled="currentPage === 1"
                        >
                            이전
                        </InfoButton>
                        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
                        <InfoButton
                            variant="outline"
                            size="sm"
                            @click="fetchLogs(currentPage + 1)"
                            :disabled="currentPage === totalPages"
                        >
                            다음
                        </InfoButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
import InfoInput from '@/components/ui/InfoInput.vue';
import InfoButton from '@/components/ui/InfoButton.vue';

// --- 1. 로그인한 사용자 ID 가져오기 ---
/** (★수정★) localStorage -> sessionStorage, 'user' -> 'user_id' */
const getLoggedInUserId = () => {
    // LoginView.vue와 router/index.js에서 사용한 'user_id' 키를 사용합니다.
    return sessionStorage.getItem('user_id');
};

// --- 2. 프로필 폼 ---
const adminId = ref(getLoggedInUserId() || 'loading...');
const adminName = ref('');
const adminPhone = ref('');
const adminEmail = ref('');

// --- 3. 비밀번호 변경 폼 ---
const currentPw = ref('');
const newPw = ref('');
const confirmPw = ref('');

/**
 * (★수정★)
 * 페이지 로드 시, 내 정보(기본 계정 정보)를 불러옵니다.
 */
const loadMyProfile = async () => {
    const userId = getLoggedInUserId();
    if (!userId) {
        alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
        // (★수정★) localStorage -> sessionStorage
        sessionStorage.clear(); // 로그인 관련 모든 정보 삭제
        window.location.href = '/login';
        return;
    }

    try {
        // (★수정★) '/api' 접두사 제거 (vite.config.js에서 처리)
        const response = await apiClient.post('/userSelectOne.json', { user_id: userId });

        if (response) {
            // (★수정★) interceptor가 data.result를 반환
            const profile = response;
            adminName.value = profile.user_name;
            adminPhone.value = profile.user_telno;
            adminEmail.value = profile.user_eml;
        } else {
            alert('프로필 정보를 불러오는 데 실패했습니다.');
        }
    } catch (error) {
        console.error('프로필 로드 실패:', error);
        alert('프로필 로드 중 오류가 발생했습니다.');
    }
};

/**
 * '변경사항 저장' 버튼 클릭 시
 */
const saveProfile = async () => {
    const userId = getLoggedInUserId();
    if (!userId) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
    }

    try {
        const params = {
            user_id: userId,
            user_name: adminName.value,
            user_telno: adminPhone.value,
            user_eml: adminEmail.value,
        };
        // (★수정★) '/api' 접두사 제거
        const response = await apiClient.post('/MyUserUpdate.json', params);

        if (response > 0) {
            // (★수정★) interceptor가 data.result를 반환
            alert('프로필이 성공적으로 저장되었습니다.');
            window.location.reload();
        } else {
            alert('프로필 저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('프로필 저장 실패:', error);
        alert('프로필 저장 중 오류가 발생했습니다.');
    }
};

/**
 * '비밀번호 변경' 버튼 클릭 시
 */
const changePassword = async () => {
    const userId = getLoggedInUserId();
    if (!userId) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
    }

    if (newPw.value !== confirmPw.value) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }
    if (!newPw.value) {
        alert('새 비밀번호를 입력하세요.');
        return;
    }

    try {
        const params = {
            user_id: userId,
            old_pw: currentPw.value,
            new_pw: newPw.value,
        };
        // (★수정★) '/api' 접두사 제거
        const response = await apiClient.post('/userPwUpdate.json', params);

        if (response > 0) {
            // (★수정★) interceptor가 data.result를 반환
            alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
            // (★수정★) localStorage -> sessionStorage
            sessionStorage.clear();
            window.location.href = '/login';
        } else {
            alert('비밀번호 변경에 실패했습니다. (현재 비밀번호가 틀렸거나 오류 발생)');
        }
    } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
};

// --- 4. 내 활동 로그 (Mock Data 유지) ---
// ... (fetchLogs 등 Mock 데이터 관련 로직은 동일) ...
const startDate = ref('');
const endDate = ref('');
const logSearchTerm = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalLogs = ref(0);
const logsPerPage = 10;
const logs = ref([]);

const allMockLogs = [
    { time: '2025-11-06 14:30', type: '로그인', detail: '시스템 로그인' },
    { time: '2025-11-06 11:15', type: '정보 조회', detail: '사용자 U003 정보 조회' },
    { time: '2025-11-06 09:45', type: '계정 관리', detail: '본인 프로필 정보 업데이트' },
    { time: '2025-11-05 17:20', type: '정보 조회', detail: '기기 D-2024-001 상세 이력 조회' },
    { time: '2025-11-05 16:50', type: '정보 조회', detail: '이벤트 로그 "사고" 유형 검색' },
];

const fetchLogs = (page) => {
    if (page < 1 || (page > totalPages.value && totalPages.value > 0)) {
        return;
    }
    console.log('로그 검색 (Mock):', {
        page,
        search: logSearchTerm.value,
        startDate: startDate.value,
        endDate: endDate.value,
    });

    const filteredLogs = allMockLogs.filter((log) => {
        return !logSearchTerm.value || log.detail.toLowerCase().includes(logSearchTerm.value.toLowerCase());
    });

    totalLogs.value = filteredLogs.length;
    totalPages.value = Math.ceil(filteredLogs.length / logsPerPage) || 1;
    const startIndex = (page - 1) * logsPerPage;
    logs.value = filteredLogs.slice(startIndex, startIndex + logsPerPage);
    currentPage.value = page;
};

const handleLogSearch = () => {
    fetchLogs(1); // 1페이지로 리셋하고 검색
};

onMounted(() => {
    loadMyProfile();
    fetchLogs(1);
});
</script>

<style scoped src="@/assets/styles/views/MyProfileView.css"></style>
