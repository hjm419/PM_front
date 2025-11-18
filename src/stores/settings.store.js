import { defineStore } from 'pinia';
import apiClient from '@/api/index.js';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        isSettingsModalOpen: false,
        kpiList: [], // t_risk_kpi 목록
        isLoading: false,
        newKpiData: {
            kpi_name: '',
            kpi_desc: '',
            weight: 1.0,
        },
    }),
    actions: {
        // ... (open/close/fetchKpis/updateKpiWeight 함수는 동일) ...
        openSettingsModal() {
            this.isSettingsModalOpen = true;
            this.fetchKpis();
        },
        closeSettingsModal() {
            this.isSettingsModalOpen = false;
        },
        async fetchKpis() {
            this.isLoading = true;
            try {
                const response = await apiClient.get('/admin/kpis');
                this.kpiList = response || [];
            } catch (error) {
                console.error('KPI 목록 조회 실패:', error);
                this.kpiList = [];
            } finally {
                this.isLoading = false;
            }
        },
        async updateKpiWeight(kpiId, newWeight) {
            try {
                await apiClient.put(`/admin/kpis/${kpiId}`, {
                    weight: parseFloat(newWeight),
                });

                await this.fetchKpis();
                alert('가중치가 성공적으로 업데이트되었습니다.');
            } catch (error) {
                console.error('KPI 가중치 업데이트 실패:', error);
                alert('업데이트에 실패했습니다.');
            }
        },

        /**
         * (★신규★)
         * POST /admin/kpis
         */
        async createKpi() {
            // (★수정★) 유효성 검사 (kpi_name 기준)
            if (!this.newKpiData.kpi_name || !this.newKpiData.weight) {
                alert('KPI 이름과 가중치는 필수입니다.');
                return;
            }
            try {
                // (★핵심 수정★)
                // 백엔드 컨트롤러/서비스도 수정할 것이므로, DB 컬럼명과 일치하는 키로 전송
                await apiClient.post('/admin/kpis', {
                    kpi_name: this.newKpiData.kpi_name,
                    kpi_desc: this.newKpiData.kpi_desc,
                    weight: parseFloat(this.newKpiData.weight),
                });

                alert('새 KPI 항목이 추가되었습니다.');

                this.newKpiData = { kpi_name: '', kpi_desc: '', weight: 1.0 };
                await this.fetchKpis();
            } catch (error) {
                console.error('KPI 생성 실패:', error);
                alert('항목 추가에 실패했습니다. (DB 에러 발생)');
            }
        },

        /**
         * (★신규★)
         * DELETE /admin/kpis/:kpiId
         */
        async deleteKpi(kpiId) {
            try {
                await apiClient.delete(`/admin/kpis/${kpiId}`);

                alert('KPI 항목이 삭제되었습니다.');
                await this.fetchKpis();
            } catch (error) {
                console.error('KPI 삭제 실패:', error);
                alert('삭제에 실패했습니다. (다른 데이터에서 사용 중일 수 있습니다)');
            }
        },
    },
});
