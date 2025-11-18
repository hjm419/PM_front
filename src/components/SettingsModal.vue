<template>
    <div v-if="store.isSettingsModalOpen" class="settings-modal-overlay" @click="close">
        <div class="settings-modal-content" @click.stop>
            <div class="settings-modal-header">
                <h3 class="settings-modal-title">설정: 위험 행동(KPI) 가중치 관리</h3>
                <button class="settings-modal-close-btn" @click="close">
                    <v-icon name="bi-x-lg" />
                </button>
            </div>
            <div class="settings-modal-body">
                <p class="description">
                    'Weight'는 해당 위험 행동이 감지되었을 때 사용자의 안전 점수에서 차감될 **감점 점수**입니다.
                </p>

                <div class="info-table-wrapper">
                    <table class="info-table">
                        <thead class="info-table-header">
                            <tr>
                                <th class="info-table-head">KPI ID</th>
                                <th class="info-table-head">위험 행동 (kpi_name)</th>
                                <th class="info-table-head">설명 (kpi_desc)</th>
                                <th class="info-table-head">가중치 (Weight)</th>
                                <th class="info-table-head" style="width: 100px">저장</th>
                                <th class="info-table-head" style="width: 100px">삭제</th>
                            </tr>
                        </thead>
                        <tbody class="info-table-body">
                            <tr v-if="store.isLoading">
                                <td colspan="6" class="info-table-cell" style="text-align: center; height: 100px">
                                    KPI 목록을 불러오는 중입니다...
                                </td>
                            </tr>
                            <tr v-else-if="store.kpiList.length === 0">
                                <td colspan="6" class="info-table-cell" style="text-align: center; height: 100px">
                                    조회된 KPI 항목이 없습니다.
                                </td>
                            </tr>
                            <tr v-else v-for="kpi in store.kpiList" :key="kpi.kpi_id" class="info-table-row">
                                <td class="info-table-cell">{{ kpi.kpi_id }}</td>
                                <td class="info-table-cell">{{ kpi.kpi_name }}</td>
                                <td class="info-table-cell">{{ kpi.kpi_desc }}</td>
                                <td class="info-table-cell">
                                    <InfoInput
                                        type="number"
                                        :modelValue="String(editingWeights[kpi.kpi_id] ?? kpi.weight)"
                                        @input="updateEditingWeight(kpi.kpi_id, $event.target.value)"
                                    />
                                </td>
                                <td class="info-table-cell">
                                    <InfoButton
                                        variant="default"
                                        size="sm"
                                        @click="handleSave(kpi.kpi_id)"
                                        :disabled="!isWeightChanged(kpi)"
                                    >
                                        Save
                                    </InfoButton>
                                </td>
                                <td class="info-table-cell">
                                    <InfoButton
                                        variant="destructive"
                                        size="sm"
                                        class="btn-delete"
                                        @click="handleDelete(kpi.kpi_id, kpi.kpi_name)"
                                    >
                                        Delete
                                    </InfoButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="add-kpi-form">
                    <h4 class="form-title">새 위험 행동 추가</h4>
                    <div class="form-grid">
                        <InfoInput placeholder="KPI 이름 (예: 인도 주행)" v-model="store.newKpiData.kpi_name" />
                        <InfoInput placeholder="설명 (예: 인도 주행 감지)" v-model="store.newKpiData.kpi_desc" />
                        <InfoInput type="number" placeholder="가중치 (예: 2.5)" v-model="store.newKpiData.weight" />
                    </div>
                    <InfoButton variant="default" @click="handleCreate" style="width: 100%; margin-top: 8px">
                        DB에 새 항목 추가
                    </InfoButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings.store.js';
import InfoInput from './ui/InfoInput.vue';
import InfoButton from './ui/InfoButton.vue';

const store = useSettingsStore();

const editingWeights = ref({});

const close = () => {
    store.closeSettingsModal();
    editingWeights.value = {};
};

// InfoInput에 입력할 때마다 임시 객체(editingWeights)에 값을 저장
const updateEditingWeight = (kpiId, newValue) => {
    editingWeights.value[kpiId] = newValue;
};

// "Save" 버튼 활성화/비활성화 여부 판단
const isWeightChanged = (kpi) => {
    const editedValue = editingWeights.value[kpi.kpi_id];
    return editedValue !== undefined && parseFloat(editedValue) !== parseFloat(kpi.weight);
};

// "Save" 버튼 클릭 시
const handleSave = async (kpiId) => {
    const newWeight = editingWeights.value[kpiId];
    if (newWeight === undefined) return;

    await store.updateKpiWeight(kpiId, newWeight);
    delete editingWeights.value[kpiId];
};

/**
 * (★신규★) "Delete" 버튼 클릭 시
 */
const handleDelete = async (kpiId, kpiName) => {
    // (★) 삭제 전 확인
    if (window.confirm(`정말 [${kpiName}] 항목을 DB에서 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        await store.deleteKpi(kpiId);
    }
};

/**
 * (★신규★) "새 항목 추가" 버튼 클릭 시
 */
const handleCreate = async () => {
    await store.createKpi();
};
</script>

<style scoped src="@/assets/styles/components/SettingsModal.css"></style>
<style scoped src="@/assets/styles/components/info/CommonUI.css"></style>
