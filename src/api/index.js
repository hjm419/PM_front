// PM_front/src/api/index.js

import axios from 'axios';

const apiClient = axios.create({
    // vite.config.js 프록시 설정에 따라 '/api'를 기본 경로로 사용
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// (인터셉터 수정)
apiClient.interceptors.response.use(
    (response) => {
        // ⬇️ (수정) 백엔드의 apiResponse 형식을 존중
        if (response.data && response.data.success === true && response.data.data !== undefined) {
            // ⬇️ (수정) 'result' 대신 'data'를 반환
            return response.data.data;
        }

        // (수정) 백엔드가 { success: false }를 보낸 경우 (로그인 실패 등)
        if (response.data && response.data.success === false) {
            return Promise.reject(new Error(response.data.message || 'API Error'));
        }

        // { result: ... } 형태가 (혹시) 섞여있다면 처리
        if (response.data && response.data.result !== undefined) {
            return response.data.result;
        }

        // 위 아무것도 해당 안 되면 그냥 데이터를 반환
        return response.data;
    },
    (error) => {
        // HTTP 상태 코드가 2xx가 아닌 경우 (401, 404, 500 등)
        return Promise.reject(error);
    }
);

export default apiClient;
