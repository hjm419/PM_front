<template>
    <nav class="sidebar">
        <div>
            <div class="sidebar-header">
                <h2>개인형 이동장치<br />관제 시스템</h2>
            </div>
            <ul class="sidebar-menu">
                <router-link to="/" class="menu-item">
                    <v-icon name="bi-grid" />
                    <span>대시보드</span>
                </router-link>

                <router-link to="/realtime" class="menu-item">
                    <v-icon name="bi-display" />
                    <span>실시간 관제</span>
                </router-link>

                <router-link to="/stats" class="menu-item">
                    <v-icon name="bi-bar-chart" />
                    <span>통계 분석</span>
                </router-link>

                <router-link to="/info" class="menu-item">
                    <v-icon name="bi-info-circle" />
                    <span>정보 조회</span>
                </router-link>
            </ul>
        </div>

        <div class="sidebar-footer">
            <button @click="handleLogout" class="menu-item logout-button">
                <v-icon name="bi-box-arrow-right" />
                <span>로그아웃</span>
            </button>
        </div>
    </nav>
</template>

<script setup>
// (★수정★) useRouter와 apiClient import
import { useRouter } from 'vue-router';
import apiClient from '@/api/index.js'; // apiClient 가져오기

const router = useRouter();

// (★수정★) 임시 로그아웃을 실제 API 연동으로 변경
const handleLogout = async () => {
    try {
        // Spring 백엔드의 /userLogout.json API 호출
        // UserController.java의 userLogout() 메서드 실행
        await apiClient.post('/userLogout.json');

        // (참고) 백엔드에서 세션이 무효화되었으므로,
        // 프론트엔드에서도 로그인 상태를 제거합니다.
    } catch (error) {
        // API 호출이 실패하더라도 프론트엔드에서는 로그아웃 처리를 강행합니다.
        console.error('로그아웃 API 호출 실패:', error);
    } finally {
        // (★수정★) sessionStorage -> localStorage
        localStorage.removeItem('user');

        // 로그인 페이지로 이동 (페이지 새로고침)
        // router.push('/login') 대신 window.location을 사용하면
        // 모든 상태(State)가 초기화되어 더 안전합니다.
        window.location.href = '/login';
    }
};
</script>

<style scoped src="@/assets/styles/components/Sidebar.css"></style>
