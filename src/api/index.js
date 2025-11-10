import axios from 'axios';

const apiClient = axios.create({
    // 1. 2단계의 'vite.config.js' 프록시 설정에 따라
    //    모든 API 요청 URL 앞에 '/api'를 붙입니다.
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. (인터셉터) 백엔드가 { result: ... } 로 감싸서 보내는 것을
//    여기서 미리 풀어서 컴포넌트(Vue)에 전달합니다.
apiClient.interceptors.response.use(
    (response) => {
        // 백엔드가 { result: ... } 형태로 응답하는 경우
        // response.data.result 값을 바로 반환합니다.
        if (response.data && response.data.result !== undefined) {
            return response.data.result;
        }
        // { result: ... } 형태가 아니면, 받은 데이터 그대로 반환
        return response.data;
    },
    (error) => {
        // 에러 처리
        return Promise.reject(error);
    }
);

export default apiClient;
