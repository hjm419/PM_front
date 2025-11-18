import { defineStore } from 'pinia';
import apiClient from '@/api/index.js';

// 날짜 포맷팅 헬퍼
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        const dateObj = new Date(dateTimeString);
        // '2025. 11. 18. 오후 4:07' 형식으로 변경
        return dateObj.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return 'N/A';
    }
};

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        // t_ride 데이터를 저장할 배열
        accidentRides: [],
        isLoading: false,
        totalCount: 0,
    }),
    actions: {
        /**
         * (★핵심★)
         * API에서 't_ride' 테이블의 'accident: true'인 최근 "종료된" 주행 목록을 불러옵니다.
         */
        async fetchNotifications() {
            if (this.isLoading) return;
            this.isLoading = true;
            try {
                // (★수정★) '/api/admin/...' -> '/admin/...' (중복된 /api 제거)
                const response = await apiClient.get('/admin/rides/recent-accidents');

                // 백엔드 응답(response.kickboards)을 알림창 형식에 맞게 매핑
                this.accidentRides = response.kickboards.map((ride) => ({
                    id: ride.rideId, // rideId를 고유 키로 사용
                    title: `[사고] 사용자 ${ride.userId || '?'}`,
                    message: `PM ${ride.pmId || '?'} (안전점수: ${ride.safetyScore})`,
                    // "종료 시간"을 기준으로 표시
                    time: formatDateTime(ride.endTime),
                    pmId: ride.pmId || 'N/A',
                }));
                this.totalCount = response.totalCount || 0;
            } catch (error) {
                console.error('최근 사고(t_ride) 목록 조회 실패:', error);
                this.accidentRides = [];
                this.totalCount = 0;
            } finally {
                this.isLoading = false;
            }
        },
        /**
         * 아이콘 클릭 시, 개수를 0으로 리셋 (단순 '읽음' 처리)
         */
        markAsRead() {
            this.totalCount = 0;
        },
    },
});
