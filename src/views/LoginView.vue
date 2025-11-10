<template>
    <div class="login-container">
        <div class="login-box">
            <h1 class="login-title">개인형 이동장치<br />관제 시스템</h1>

            <form class="login-form" @submit.prevent="userLogin">
                <input v-model="loginData.login_id" type="text" class="login-input" placeholder="아이디" required />

                <input
                    v-model="loginData.user_pw"
                    type="password"
                    class="login-input"
                    placeholder="비밀번호"
                    required
                />

                <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

                <button type="submit" class="login-button">로그인</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api';

const router = useRouter();

// T_USER 테이블의 login_id, user_pw 컬럼과 일치
const loginData = ref({
    login_id: '',
    user_pw: '',
});
const errorMsg = ref(null);

const userLogin = async () => {
    if (!loginData.value.login_id || !loginData.value.user_pw) {
        errorMsg.value = '아이디와 비밀번호를 모두 입력해주세요.';
        return;
    }

    try {
        // 1. T_USER 테이블의 컬럼명과 일치하는 JSON으로 서버에 요청
        const loginResult = await apiClient.post('/auth/login', {
            login_id: loginData.value.login_id,
            user_pw: loginData.value.user_pw,
        });

        // 2. (로그인 성공)
        //    백엔드가 T_USER에서 찾은 정보를 반환 (user_id, nickname, role 등)
        if (loginResult && loginResult.user_id) {
            // 3. (수정됨) T_USER 테이블 정보를 sessionStorage에 저장
            sessionStorage.setItem('user_id', loginResult.user_id);

            // T_USER의 nickname과 role 컬럼 정보도 저장
            if (loginResult.nickname) {
                sessionStorage.setItem('nickname', loginResult.nickname);
            }
            if (loginResult.role) {
                sessionStorage.setItem('role', loginResult.role);
            }

            errorMsg.value = null;
            router.push('/'); // 대시보드 페이지로 이동
        } else {
            // 4. (로그인 실패)
            errorMsg.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
        }
    } catch (error) {
        // 5. (로그인 실패) 서버 에러
        console.error('로그인 실패 또는 서버 오류:', error);
        errorMsg.value = '로그인 중 오류가 발생했습니다.';
    }
};
</script>

<style scoped src="@/assets/styles/views/LoginView.css"></style>
