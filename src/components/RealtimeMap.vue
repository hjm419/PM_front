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
                    <span class="legend-color color-high"></span><span class="legend-label">운행중</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-available"></span><span class="legend-label">대기</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color color-danger"></span><span class="legend-label">고장</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    districts: { type: Object, required: true },
    // (★수정★) users -> kickboards
    kickboards: { type: Array, required: true },
});

const mapInstance = ref(null);
const mapLoaded = ref(false);
const pmOverlays = ref([]);

// (기존) 킥보드 SVG 아이콘 (원본)
const kickboardSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 12H16V9H18.5V12ZM18.15 13C18.6 13 19 13.4 19 13.85C19 14.3 18.6 14.7 18.15 14.7C17.7 14.7 17.3 14.3 17.3 13.85C17.3 13.4 17.7 13 18.15 13ZM6.85 13C7.3 13 7.7 13.4 7.7 13.85C7.7 14.3 7.3 14.7 6.85 14.7C6.4 14.7 6 14.3 6 13.85C6 13.4 6.4 13 6.85 13ZM5.5 12H8V9H5.5V12ZM14.75 16H9.25C9.25 16 9 15.75 9 15.5C9 15.25 9.25 15 9.25 15H14.75C14.75 15 15 15.25 15 15.5C15 15.75 14.75 16 14.75 16ZM19 16.5V18H5V16.5L6.5 15.25H17.5L19 16.5ZM13.5 6.5H10.5L11.25 4H12.75L13.5 6.5Z" /></svg>`;

onMounted(() => {
    loadMapScript();
});

watch(
    () => props.kickboards,
    (newKickboards) => {
        // (★수정★) 맵이 로드되었고, 킥보드 데이터가 1개 이상 있을 때만 실행
        if (mapLoaded.value && newKickboards.length > 0) {
            // 1. 마커를 그립니다.
            displayPMsOnMap(newKickboards);

            // 2. (★핵심 수정★) 모든 킥보드를 포함하는 경계(Bounds)를 계산합니다.
            const bounds = new window.kakao.maps.LatLngBounds();
            newKickboards.forEach((kb) => {
                // (★추가★) 유효한 좌표만 경계에 포함
                if (kb.lat && kb.lng) {
                    bounds.extend(new window.kakao.maps.LatLng(kb.lat, kb.lng));
                }
            });

            // 3. (★핵심 수정★) 계산된 경계(Bounds)로 지도의 중심과 줌 레벨을 자동 설정합니다.
            if (mapInstance.value) {
                mapInstance.value.setBounds(bounds);
            }
        }
        // (★추가★) 킥보드 데이터가 0개이면 (예: 운행중 목록 0개) 마커만 지웁니다.
        else if (mapLoaded.value) {
            displayPMsOnMap([]);
        }
    },
    { deep: true }
);

const loadMapScript = () => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        initMap();
    } else {
        setTimeout(loadMapScript, 100);
    }
};

const initMap = () => {
    const mapContainer = document.getElementById('realtime-map');
    if (!mapContainer || mapInstance.value) return;

    // (★수정★) 처음 지도를 생성할 때는 기본 위치로 설정합니다.
    // (watch에서 킥보드 데이터가 들어오면 어차피 중심으로 이동합니다)
    const mapOption = {
        center: new window.kakao.maps.LatLng(35.8244, 128.738),
        level: 5,
        disableDefaultUI: true,
    };

    mapInstance.value = new window.kakao.maps.Map(mapContainer, mapOption);
    mapLoaded.value = true;
    mapInstance.value.relayout();

    // (★제거★) initMap에서는 마커를 그리지 않습니다. (watch에서 처리)
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

// (★수정★) '내 위치' 버튼은 경계(Bounds) 계산 대신 '내 위치'로 이동
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

                // (★수정★) setBounds가 아닌 setCenter로 '내 위치'로 이동
                mapInstance.value.setCenter(currentPosition);
                mapInstance.value.setLevel(4); // (내 위치는 확대)
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

/**
 * (★수정★)
 * getScoreColorClass -> getStatusColorClass
 * (global.css의 상태별 마커 스타일을 사용합니다)
 */
const getStatusColorClass = (status) => {
    if (status === 'in_use') return 'status-running'; // (파랑)
    if (status === 'maintenance') return 'status-error'; // (빨강)
    return ''; // (대기 'available'은 기본 회색)
};

const displayPMsOnMap = (kickboards) => {
    if (!mapInstance.value) return;
    pmOverlays.value.forEach((overlay) => overlay.setMap(null));
    pmOverlays.value = [];

    // (★수정★) users -> kickboards
    kickboards.forEach((kb) => {
        // (★수정★) getScoreColorClass -> getStatusColorClass
        const statusClass = getStatusColorClass(kb.status);
        const content = `<div class="pm-icon-overlay ${statusClass}">${kickboardSVG}</div>`;

        const position = new window.kakao.maps.LatLng(kb.lat, kb.lng);
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
