<template>
    <div class="map-container">
        <div id="realtime-map" class="map-view">
            <div v-if="!mapLoaded" class="map-text">지도 로딩 중...</div>

            <div class="map-controls">
                <button class="map-control-btn" @click="zoomIn">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
                <div class="map-control-divider"></div>
                <button class="map-control-btn" @click="goToMyLocation">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 12 9.75Z"
                        />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 12c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5 3.358 7.5 7.5 7.5 7.5-3.358 7.5-7.5Z"
                        />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v-3m0 18v-3m-7.5-6h-3m18 0h-3" />
                    </svg>
                </button>
                <div class="map-control-divider"></div>
                <button class="map-control-btn" @click="zoomOut">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                    </svg>
                </button>
            </div>

            <div class="map-legend">
                <div class="legend-item">
                    <span class="legend-color color-danger"></span><span class="legend-label">0-20점</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-low"></span><span class="legend-label">21-60점</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-mid"></span><span class="legend-label">61-80점</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-high"></span><span class="legend-label">81-100점</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// (★수정★) computed 삭제
import { ref, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
    districts: { type: Object, required: true },
    users: { type: Array, required: true },
});

const mapInstance = ref(null);
const mapLoaded = ref(false);
const pmOverlays = ref([]);

// (★삭제★) selectedSiDo, selectedSiGunGu, siGunGuList 관련 로직 모두 제거
// const selectedSiDo = ref('');
// const selectedSiGunGu = ref('');
// const siGunGuList = computed(...);

// 대시보드(MapInfo.vue)에서 사용하는 킥보드 아이콘 SVG 문자열
const kickboardSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 12H16V9H18.5V12ZM18.15 13C18.6 13 19 13.4 19 13.85C19 14.3 18.6 14.7 18.15 14.7C17.7 14.7 17.3 14.3 17.3 13.85C17.3 13.4 17.7 13 18.15 13ZM6.85 13C7.3 13 7.7 13.4 7.7 13.85C7.7 14.3 7.3 14.7 6.85 14.7C6.4 14.7 6 14.3 6 13.85C6 13.4 6.4 13 6.85 13ZM5.5 12H8V9H5.5V12ZM14.75 16H9.25C9.25 16 9 15.75 9 15.5C9 15.25 9.25 15 9.25 15H14.75C14.75 15 15 15.25 15 15.5C15 15.75 14.75 16 14.75 16ZM19 16.5V18H5V16.5L6.5 15.25H17.5L19 16.5ZM13.5 6.5H10.5L11.25 4H12.75L13.5 6.5Z" /></svg>`;

onMounted(() => {
    nextTick(() => {
        loadMapScript();
    });
});

// (★삭제★) props.districts 감시 로직 제거
// watch(() => props.districts, ...);

watch(
    () => props.users,
    (newUsers) => {
        if (mapLoaded.value && newUsers.length > 0) {
            displayPMsOnMap(newUsers);
        }
    },
    { deep: true }
);

const loadMapScript = () => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        initMap();
        return;
    }
    if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function') {
        window.kakao.maps.load(() => {
            initMap();
        });
    } else {
        console.error('Kakao Maps 스크립트를 찾을 수 없습니다. index.html을 확인하세요.');
    }
};

const initMap = async () => {
    await nextTick();
    const mapContainer = document.getElementById('realtime-map');
    if (!mapContainer || mapInstance.value) return;

    const mapOption = {
        center: new window.kakao.maps.LatLng(35.8244, 128.738), // 기본 중심 (경산시)
        level: 5,
        disableDefaultUI: true,
    };

    mapInstance.value = new window.kakao.maps.Map(mapContainer, mapOption);
    mapLoaded.value = true;
    mapInstance.value.relayout();

    // (★삭제★) moveMap() 호출 로직 제거

    if (props.users.length > 0) {
        displayPMsOnMap(props.users);
    }
};

const zoomIn = () => {
    if (mapInstance.value) {
        mapInstance.value.setLevel(mapInstance.value.getLevel() - 1);
    }
};

const zoomOut = () => {
    if (mapInstance.value) {
        mapInstance.value.setLevel(mapInstance.value.getLevel() + 1);
    }
};

// (★삭제★) moveMap 함수 제거
// const moveMap = () => { ... };

const goToMyLocation = () => {
    if (!mapInstance.value) {
        alert('지도가 아직 로드되지 않았습니다.');
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const currentPosition = new window.kakao.maps.LatLng(lat, lng);
                mapInstance.value.setCenter(currentPosition);
                mapInstance.value.relayout();
                new window.kakao.maps.Marker({
                    map: mapInstance.value,
                    position: currentPosition,
                    title: '현재 위치',
                });
            },
            () => {
                alert('위치 정보를 가져오는 데 실패했습니다.');
            }
        );
    } else {
        alert('이 브라우저는 Geolocation을 지원하지 않습니다.');
    }
};

const getScoreColorClass = (score) => {
    if (score >= 81) return 'high';
    if (score >= 61) return 'mid';
    if (score >= 21) return 'low';
    return 'danger';
};

const displayPMsOnMap = (users) => {
    if (!mapInstance.value) return;
    pmOverlays.value.forEach((overlay) => overlay.setMap(null));
    pmOverlays.value = [];
    users.forEach((user) => {
        const scoreClass = getScoreColorClass(user.score);
        const content = `<div class="pm-icon-overlay ${scoreClass}">${kickboardSVG}</div>`;

        const position = new window.kakao.maps.LatLng(user.lat, user.lng);
        const customOverlay = new window.kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1,
            xAnchor: 0.5,
        });
        customOverlay.setMap(mapInstance.value);
        pmOverlays.value.push(customOverlay);
    });
};
</script>

<style scoped src="@/assets/styles/components/RealtimeMap.css"></style>

<style scoped>
.map-text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 1.25rem;
    font-weight: 500;
}
</style>
