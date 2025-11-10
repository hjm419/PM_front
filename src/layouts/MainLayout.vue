<template>
    <div class="app-layout">
        <Sidebar />
        <div class="main-content-wrapper">
            <Header />
            <main class="page-content">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
</script>

<style scoped src="@/assets/styles/layouts/MainLayout.css"></style>
