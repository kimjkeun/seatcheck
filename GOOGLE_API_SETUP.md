# Google API 연동 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 OAuth 동의 화면 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 왼쪽 메뉴에서 "API 및 서비스" > "OAuth 동의 화면" 선택
3. 다음 정보 설정:
   - 사용자 유형: 외부
   - 앱 이름: "이동 수업 출석 체크"
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. 스코프 추가:
   - `https://www.googleapis.com/auth/spreadsheets` 추가
5. 테스트 사용자:
   - 본인 이메일 주소 추가

### 1.2 사용자 인증 정보 설정

1. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 선택
2. 사용자 인증 정보 만들기 > "OAuth 클라이언트 ID" 선택
3. 애플리케이션 유형: 웹 애플리케이션
4. 이름: "이동 수업 출석 체크"
5. 승인된 JavaScript 원본:
   - `http://localhost:3000` 추가
6. 승인된 리디렉션 URI:
   - `http://localhost:3000` 추가
   - `http://localhost:3000/` 추가 (슬래시 포함)

### 1.3 API 활성화

1. 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 선택
2. "Google Sheets API" 검색 후 선택
3. "사용 설정" 버튼 클릭

## 2. Google 스프레드시트 설정

1. [Google Drive](https://drive.google.com/)에 접속
2. 사용할 스프레드시트 열기 (ID: 1JwXPxqGYBbkpegYSF6-y53rkIHsEkZrshnX1egh6v4s)
3. "공유" 버튼 클릭
4. 다음 이메일 추가:
   - 본인 계정 (편집자 권한)
   - 애플리케이션 사용자 계정 (필요한 경우)
5. 시트 이름 확인:
   - 시트 이름이 "출석부"인지 확인
   - 아니라면 시트 이름을 "출석부"로 변경하거나 CONFIG.sheetName 값 수정

## 3. 브라우저 설정

1. Chrome 브라우저 사용 권장
2. 팝업 차단 해제:
   - Chrome 설정 > 개인정보 및 보안 > 사이트 설정 > 팝업 및 리디렉션
   - `http://localhost:3000`을 허용 목록에 추가
3. 쿠키 설정:
   - Chrome 설정 > 개인정보 및 보안 > 쿠키 및 기타 사이트 데이터
   - 모든 쿠키 허용 또는 `localhost`에 대한 쿠키 허용

## 4. 문제 해결

### 4.1 401 오류 (인증 실패)

- OAuth 동의 화면이 올바르게 설정되었는지 확인
- 테스트 사용자에 본인 이메일이 추가되었는지 확인
- 브라우저의 개발자 도구 콘솔에서 오류 메시지 확인

### 4.2 팝업 차단 오류

- 브라우저의 팝업 차단 설정 확인
- `http://localhost:3000`에서 팝업을 허용하도록 설정

### 4.3 CORS 오류

- 승인된 JavaScript 원본에 `http://localhost:3000`이 추가되었는지 확인
- 브라우저 캐시 및 쿠키 삭제 후 다시 시도

## 5. 설정 정보

```javascript
const CONFIG = {
    googleApiKey: 'AIzaSyCr3FG_bQ0D5Dy-uvkDk2PjO2a4m3pjDZE',
    spreadsheetId: '1JwXPxqGYBbkpegYSF6-y53rkIHsEkZrshnX1egh6v4s',
    sheetName: '출석부',
    clientId: '531510399586-vu2pjqb4i2k9nr050ejm43kmunv0u486.apps.googleusercontent.com',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
};
```
