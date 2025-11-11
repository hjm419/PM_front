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
import { useRouter } from 'vue-router';
import apiClient from '@/api/index.js';

const router = useRouter();

const handleLogout = async () => {
    try {
        // (★수정★) '/api' 접두사 제거
        await apiClient.post('/userLogout.json');
    } catch (error) {
        console.error('로그아웃 API 호출 실패:', error);
    } finally {
        // (★수정★) localStorage -> sessionStorage
        sessionStorage.clear(); // 로그인 관련 모든 정보 삭제
        window.location.href = '/login';
    }
};
</script>

<style scoped src="@/assets/styles/components/Sidebar.css"></style>
