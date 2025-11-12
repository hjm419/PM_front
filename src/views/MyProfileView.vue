<template>
    <div class="profile-container">
        <div class="profile-grid">
            <div class="profile-card">
                <h3 class="card-title">기본 계정 정보</h3>
                <form class="profile-form" @submit.prevent="saveProfile">
                    <div class="form-group">
                        <label class="profile-label" for="adminId">관리자 아이디 (login_id)</label>
                        <input id="adminId" v-model="profileData.login_id" type="text" class="profile-input" readonly />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="adminName">관리자 이름 (user_name)</label>
                        <input
                            id="adminName"
                            v-model="profileData.user_name"
                            type="text"
                            class="profile-input"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="adminPhone">휴대폰 번호 (telno)</label>
                        <input
                            id="adminPhone"
                            v-model="profileData.telno"
                            type="tel"
                            class="profile-input"
                            placeholder="010-0000-0000"
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
                        <input
                            id="currentPw"
                            v-model="passwordData.currentPw"
                            type="password"
                            class="profile-input"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="newPw">새 비밀번호</label>
                        <input id="newPw" v-model="passwordData.newPw" type="password" class="profile-input" required />
                    </div>
                    <div class="form-group">
                        <label class="profile-label" for="confirmPw">새 비밀번호 확인</label>
                        <input
                            id="confirmPw"
                            v-model="passwordData.confirmPw"
                            type="password"
                            class="profile-input"
                            required
                        />
                    </div>
                    <button type="submit" class="profile-button">비밀번호 변경</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/index.js';
// (★제거됨★) '내 활동 로그'에서만 사용하던 InfoInput, InfoButton import가 삭제되었습니다.
// import InfoInput from '@/components/ui/InfoInput.vue';
// import InfoButton from '@/components/ui/InfoButton.vue';

// --- 1. (★핵심 수정★) 로그인한 사용자 '객체' 가져오기 ---
const loggedInUser = ref(null);

const getLoggedInUser = () => {
    // LoginView에서 'user' 키로 localStorage에 저장한 객체를 가져옴
    const userString = localStorage.getItem('user');
    if (userString) {
        return JSON.parse(userString);
    }
    return null;
};

// --- 2. 프로필 폼 데이터 ---
const profileData = ref({
    user_id: '',
    login_id: 'loading...',
    user_name: '',
    telno: '',
});

// --- 3. 비밀번호 변경 폼 ---
const passwordData = ref({
    currentPw: '',
    newPw: '',
    confirmPw: '',
});

/**
 * (★핵심 수정★)
 * 페이지 로드 시, API 호출 대신 localStorage에서 프로필을 로드합니다.
 */
const loadProfileFromStorage = () => {
    const user = getLoggedInUser();

    // (★수정★) 로그인 정보가 없으면 알림창 띄우고 돌려보냄
    if (!user || !user.user_id) {
        alert('로그인 정보가 없습니다. 다시 로그인해주세요.');
        localStorage.clear();
        window.location.href = '/login';
        return;
    }

    loggedInUser.value = user; // 사용자 정보 저장

    // 폼 데이터 채우기 (t_user 스키마 기준)
    profileData.value.user_id = user.user_id;
    profileData.value.login_id = user.login_id;
    profileData.value.user_name = user.user_name;
    profileData.value.telno = user.telno;
};

/**
 * '변경사항 저장' 버튼 클릭 시 (★기능 활성화★)
 */
const saveProfile = async () => {
    if (!loggedInUser.value) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
    }

    try {
        const params = {
            // t_user 스키마에 맞는 컬럼명으로 전송
            user_name: profileData.value.user_name,
            telno: profileData.value.telno,
        };

        // (★수정★) 요청하신 /api/users/me 경로로 PUT 요청
        // (api/index.js의 Interceptor가 토큰을 자동으로 헤더에 추가해줍니다.)
        const response = await apiClient.put('/users/me', params);

        alert('프로필이 성공적으로 저장되었습니다.');

        // (★추가★) 변경된 정보를 localStorage에도 업데이트
        // (백엔드 /users/me가 수정한 user 객체를 반환한다고 가정)
        const updatedUser = { ...loggedInUser.value, ...response };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 폼 데이터 다시 로드 (API 응답 기준으로)
        loadProfileFromStorage();
    } catch (error) {
        console.error('프로필 저장 실패:', error);
        alert('프로필 저장 중 오류가 발생했습니다.');
    }
};

/**
 * '비밀번호 변경' 버튼 클릭 시
 */
const changePassword = async () => {
    if (passwordData.value.newPw !== passwordData.value.confirmPw) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }
    if (!passwordData.value.newPw) {
        alert('새 비밀번호를 입력하세요.');
        return;
    }

    try {
        // (★핵심 수정★) API 명세서의 'PUT /api/auth/password' 경로를 사용

        const params = {
            currentPassword: passwordData.value.currentPw,
            newPassword: passwordData.value.newPw,
        };

        await apiClient.put(`/auth/password`, params);

        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        localStorage.clear();
        window.location.href = '/login';
    } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다. (현재 비밀번호가 틀렸거나 오류 발생)');
    }
};

// --- 4. (★제거됨★) '내 활동 로그' 관련 스크립트가 모두 삭제되었습니다. ---
// const startDate = ref('');
// ...
// const handleLogSearch = () => { ... };

// --- 5. (★수정★) 마운트 시 API 대신 localStorage에서 정보 로드 ---
onMounted(() => {
    loadProfileFromStorage();
    // (★제거됨★) fetchLogs(1) 호출이 삭제되었습니다.
});
</script>

<style scoped src="@/assets/styles/views/MyProfileView.css"></style>
