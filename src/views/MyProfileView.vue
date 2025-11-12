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
    if (!user) {
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
 * '변경사항 저장' 버튼 클릭 시
 */
const saveProfile = async () => {
    if (!loggedInUser.value) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        return;
    }

    try {
        const params = {
            // 바뀔 수 있는 정보만 전송
            user_name: profileData.value.user_name,
            telno: profileData.value.telno,
            // (참고: login_id는 변경하지 않음)
        };

        // (★수정★) 백엔드 API 경로(/api/users/:id)와 일치시킴
        // PM_back/src/api/user.routes.js -> router.put("/:id", ...)
        // PM_back/src/services/user.service.js -> updateUser (현재 TODO)
        const response = await apiClient.put(`/users/${loggedInUser.value.user_id}`, params);

        // (참고: 백엔드 service가 "TODO"이므로, 지금은 성공 알림만 띄웁니다)
        alert('프로필이 성공적으로 저장되었습니다. (백엔드 updateUser 로직 구현 필요)');

        // (★추가★) 변경된 정보를 localStorage에도 업데이트
        const updatedUser = { ...loggedInUser.value, ...params };
        localStorage.setItem('user', JSON.stringify(updatedUser));
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
        // (★참고★)
        // PM_back 폴더에는 비밀번호 변경 API가 없습니다. (/auth/logout만 추가함)
        // '/api/auth/change-password' 같은 엔드포인트를 백엔드에 구현해야 합니다.
        alert('비밀번호 변경 API가 백엔드에 구현되어 있지 않습니다. (TODO)');

        // --- 아래는 백엔드 구현 후 사용할 코드 예시 ---
        /*
        const params = {
            old_pw: passwordData.value.currentPw,
            new_pw: passwordData.value.newPw,
        };
        // (예시 API) /api/users/me/password
        await apiClient.put(`/users/me/password`, params);
        
        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        localStorage.clear();
        window.location.href = '/login';
        */
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
