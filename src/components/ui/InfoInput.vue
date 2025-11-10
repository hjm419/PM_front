<template>
    <div class="info-input-wrapper">
        <span v-if="hasIcon" class="info-input-icon">
            <slot name="icon"></slot>
        </span>
        <input
            :class="['info-input', { 'has-icon': hasIcon }]"
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
        />
    </div>
</template>
<script setup>
defineProps({
    modelValue: String,
    placeholder: String,
    type: { type: String, default: 'text' },
    hasIcon: { type: Boolean, default: false },
});
defineEmits(['update:modelValue']);
</script>
<style scoped src="../../assets/styles/components/info/CommonUI.css"></style>

<style scoped>
.info-input[type='date'] {
    /* InfoInput.vue가 36px/40px 등 높이가 고정되어 있어 
       date input이 내부에서 찌그러지는 현상 보정 */
    line-height: 1.25rem;
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
}
</style>
