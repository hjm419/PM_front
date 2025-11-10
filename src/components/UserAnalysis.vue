<template>
    <div class="user-analysis-card">
        <h3 class="card-title">사용자 분석</h3>

        <div class="analysis-content">
            <div class="user-list-wrapper">
                <h4 class="list-title">위험 점수 높은 사용자</h4>
                <ul class="user-list">
                    <li>
                        <span>user1236</span>
                        <span class="score-bad">평균 42점</span>
                    </li>
                    <li>
                        <span>user1235</span>
                        <span class="score-bad">평균 37점</span>
                    </li>
                </ul>
            </div>

            <div class="user-list-wrapper highlight">
                <h4 class="list-title">오늘 가장 많이 운행한 사용자</h4>
                <ul class="user-list">
                    <li>
                        <span>user1234</span>
                        <span>5회</span>
                    </li>
                    <li>
                        <span>user1235</span>
                        <span>4회</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup></script>

<style scoped src="@/assets/styles/components/UserAnalysis.css"></style>
