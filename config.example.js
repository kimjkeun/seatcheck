// API 설정 예시 파일
// 실제 사용 시 이 파일을 config.js로 복사하고 API 키 등을 입력하세요
// config.js는 .gitignore에 추가되어 있으므로 GitHub에 업로드되지 않습니다

const API_CONFIG = {
    // Google API 키 (https://console.cloud.google.com/apis/credentials에서 생성)
    googleApiKey: 'YOUR_GOOGLE_API_KEY',
    
    // OAuth 클라이언트 ID (https://console.cloud.google.com/apis/credentials에서 생성)
    clientId: 'YOUR_OAUTH_CLIENT_ID',
    
    // Google 스프레드시트 ID (스프레드시트 URL에서 추출)
    // 예: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    spreadsheetId: 'YOUR_SPREADSHEET_ID'
};
