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

// t_user 스키마의 login_id, user_pw와 일치
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
        // 1. (수정됨) auth.service.js가 반환한 { token, user } 객체가 loginResult가 됨
        const loginResult = await apiClient.post('/auth/login', {
            login_id: loginData.value.login_id,
            user_pw: loginData.value.user_pw,
        });

        // 2. (수정됨) loginResult.user 객체와 user_id가 있는지 확인
        if (loginResult && loginResult.user && loginResult.user.user_id) {
            // 3. (핵심 수정)
            // MyProfileView, Sidebar와 일치하도록 'localStorage'에
            // 'user' 객체 전체를 JSON 문자열로 저장합니다.
            // (token도 user 객체에 포함시켜 저장)
            const userToStore = {
                ...loginResult.user,
                token: loginResult.token,
            };
            localStorage.setItem('user', JSON.stringify(userToStore));

            errorMsg.value = null;
            router.push('/'); // 대시보드 페이지로 이동
        } else {
            // 4. (로그인 실패)
            errorMsg.value = '아이디 또는 비밀번호가 일치하지 않습니다.';
        }
    } catch (error) {
        // 5. (로그인 실패) 서버 에러 또는 apiResponse.success === false
        console.error('로그인 실패 또는 서버 오류:', error);
        errorMsg.value = error.message || '로그인 중 오류가 발생했습니다.';
    }
};
</script>

<style scoped src="@/assets/styles/views/LoginView.css"></style>
