// PM_front/src/api/index.js

import axios from 'axios';

const apiClient = axios.create({
    // vite.config.js 프록시 설정에 따라 '/api'를 기본 경로로 사용
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// (★신규★) 요청 인터셉터 추가
// 모든 API 요청이 전송되기 전에 이 코드가 실행됩니다.
apiClient.interceptors.request.use(
    (config) => {
        // 1. localStorage에서 'user' 객체를 가져옵니다.
        const userString = localStorage.getItem('user');

        if (userString) {
            // 2. 객체를 파싱하여 토큰을 추출합니다.
            // (LoginView.vue에서 userToStore에 token을 포함시켜 저장했음)
            const user = JSON.parse(userString);
            const token = user?.token;

            // 3. 토큰이 있으면, HTTP 헤더에 추가합니다.
            if (token) {
                // 백엔드의 auth.middleware.js가 'Authorization' 헤더를 확인합니다.
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config; // 수정된 config로 요청을 계속 진행
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

// (기존) 응답 인터셉터 (백엔드 응답 형식에 맞게 수정)
apiClient.interceptors.response.use(
    (response) => {
        // ⬇️ (수정) 백엔드의 apiResponse 형식을 존중 (PM_back-main - 복사본/src/utils/apiResponse.js)
        if (response.data && response.data.success === true && response.data.data !== undefined) {
            // ⬇️ (수정) 'result' 대신 'data'를 반환
            return response.data.data;
        }

        // (수정) 백엔드가 { success: false }를 보낸 경우 (로그인 실패 등)
        if (response.data && response.data.success === false) {
            return Promise.reject(new Error(response.data.message || 'API Error'));
        }

        // (수정) 기존 프론트엔드용 응답 형식도 호환
        if (response.data && response.data.result !== undefined) {
            return response.data.result;
        }

        // 위 아무것도 해당 안 되면 그냥 데이터를 반환
        return response.data;
    },
    (error) => {
        // HTTP 상태 코드가 2xx가 아닌 경우 (401, 404, 500 등)

        // (★신규★) 401 (Unauthorized) 에러인 경우, 토큰이 만료되었거나 유효하지 않음
        if (error.response && error.response.status === 401) {
            alert('세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.');
            localStorage.removeItem('user'); // 로컬 저장소의 사용자 정보 삭제
            window.location.href = '/login'; // 로그인 페이지로 강제 이동
        }

        return Promise.reject(error);
    }
);

export default apiClient;
