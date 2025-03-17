// Configuration
const CONFIG = {
    rows: 7,
    cols: 5,
    // API 키와 클라이언트 ID는 config.js에서 로드됨
    sheetName: 'Sheet1', // 영문 시트 이름으로 변경 (기본값은 Sheet1)
    sheetId: 0 // 시트 ID (첫 번째 시트는 보통 0)
};

// State
let state = {
    rows: 5,
    cols: 6,
    currentClass: '',
    seats: [],
    editMode: false,
    selectedSeatIndex: -1,
    classes: [] // 저장된 반 목록
};

// DOM Elements
const elements = {
    seatingContainer: document.querySelector('.seating-container'),
    seatingChart: document.getElementById('seating-chart'),
    editModeBtn: document.getElementById('edit-mode-btn'),
    saveBtn: document.getElementById('save-btn'),
    loadBtn: document.getElementById('load-btn'),
    submitAttendanceBtn: document.getElementById('submit-attendance-btn'),
    classSelect: document.getElementById('class-select'),
    deleteClassBtn: document.getElementById('delete-class-btn'),
    totalCount: document.getElementById('total-count'),
    presentCount: document.getElementById('present-count'),
    absentCount: document.getElementById('absent-count'),
    studentModal: document.getElementById('student-modal'),
    closeModalBtn: document.getElementById('close-modal'),
    studentNameInput: document.getElementById('student-name'),
    studentNumberInput: document.getElementById('student-number'),
    attendanceStatusSelect: document.getElementById('attendance-status-select'),
    saveStudentBtn: document.getElementById('save-student-btn'),
    templateModal: document.getElementById('template-modal'),
    closeTemplateModal: document.getElementById('closeTemplateModal'),
    classSelectTemplate: document.getElementById('class-select-template'),
    rowsInput: document.getElementById('rows'),
    colsInput: document.getElementById('cols'),
    templateGrid: document.getElementById('templateGrid'),
    saveTemplateBtn: document.getElementById('saveTemplate'),
    excelPasteArea: document.getElementById('excelPaste'),
    parseExcelDataBtn: document.getElementById('parseExcelData'),
    openTemplateModalBtn: document.getElementById('open-template-modal-btn'),
    applyDirectlyBtn: document.getElementById('applyDirectly')
};

// API 설정 로드
function loadApiConfig() {
    if (typeof API_CONFIG !== 'undefined') {
        CONFIG.googleApiKey = API_CONFIG.googleApiKey;
        CONFIG.clientId = API_CONFIG.clientId;
        CONFIG.spreadsheetId = API_CONFIG.spreadsheetId;
        console.log('API 설정이 로드되었습니다.');
    } else {
        console.error('API 설정을 찾을 수 없습니다. config.js 파일이 로드되었는지 확인하세요.');
    }
}

// Initialize the application
function init() {
    console.log('초기화 시작...');
    
    // API 설정 로드
    loadApiConfig();
    
    // 기본 반 설정 확인
    ensureDefaultClasses();
    
    // DOM 요소 로깅
    console.log('DOM 요소 확인:', {
        editModeBtn: !!elements.editModeBtn,
        saveBtn: !!elements.saveBtn,
        templateModal: !!elements.templateModal,
        closeTemplateModal: !!elements.closeTemplateModal,
        openTemplateModalBtn: !!elements.openTemplateModalBtn,
        deleteClassBtn: !!elements.deleteClassBtn,
        applyDirectlyBtn: !!elements.applyDirectlyBtn,
        saveTemplateBtn: !!elements.saveTemplateBtn
    });
    
    // 버튼 요소 직접 확인
    console.log('직접 DOM 요소 확인:');
    console.log('applyDirectly 버튼:', document.getElementById('applyDirectly'));
    console.log('saveTemplate 버튼:', document.getElementById('saveTemplate'));
    
    // 빈 자리 배치 생성
    createEmptySeatingChart();
    
    // 이벤트 리스너 연결
    attachEventListeners();
    
    // 저장된 반 목록 로드
    loadClassList();
    updateClassList();
    
    // 저장된 자리 배치 로드 (반이 선택된 경우)
    if (state.currentClass) {
        loadSeatingArrangement();
    }
    
    // 출석 상태 업데이트
    updateAttendanceCounts();
    
    // 템플릿 그리드 생성
    createTemplateGrid();
    
    console.log('초기화 완료!');
}

// 기본 반 설정 추가 (최초 실행 시)
function ensureDefaultClasses() {
    console.log('기본 반 설정 확인 중...');
    
    // localStorage 상태 확인
    console.log('localStorage 확인:', {
        classList: localStorage.getItem('classList'),
        currentClass: localStorage.getItem('currentClass'),
        seatingArrangements: localStorage.getItem('seatingArrangements')
    });
    
    // 반 목록 가져오기
    const classList = JSON.parse(localStorage.getItem('classList') || '[]');
    
    // 반 목록이 비어있으면 기본 반 추가
    if (classList.length === 0) {
        console.log('반 목록이 비어있습니다. 기본 반을 추가합니다.');
        
        // 기본 반 추가
        const defaultClasses = ['1학년 1반', '1학년 2반', '2학년 1반', '2학년 2반'];
        localStorage.setItem('classList', JSON.stringify(defaultClasses));
        
        // state 업데이트
        state.classes = defaultClasses;
        
        console.log('기본 반 설정이 추가되었습니다:', defaultClasses);
    } else {
        console.log('기존 반 목록이 있습니다:', classList);
    }
}

// Create an empty seating chart
function createEmptySeatingChart() {
    elements.seatingChart.innerHTML = '';
    state.seats = [];
    
    for (let i = 0; i < CONFIG.rows * CONFIG.cols; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat empty';
        seat.dataset.index = i;
        seat.innerHTML = '<div class="student-name">빈 자리</div>';
        
        elements.seatingChart.appendChild(seat);
        
        state.seats.push({
            index: i,
            empty: true,
            name: '',
            number: '',
            status: 'present'
        });
    }
}

// Attach event listeners
function attachEventListeners() {
    console.log('이벤트 리스너 연결 시작...');
    
    // Class selection
    elements.classSelect.addEventListener('change', (e) => {
        console.log('반 선택 변경:', e.target.value);
        state.currentClass = e.target.value;
        
        if (state.currentClass) {
            loadSeatingArrangement();
        } else {
            createEmptySeatingChart();
            updateAttendanceCounts();
        }
    });
    
    // Edit mode toggle
    elements.editModeBtn.addEventListener('click', toggleEditMode);
    
    // Save and load buttons
    elements.saveBtn.addEventListener('click', saveSeatingArrangement);
    elements.loadBtn.addEventListener('click', loadSeatingArrangement);
    
    // Submit attendance
    elements.submitAttendanceBtn.addEventListener('click', submitAttendance);
    
    // Seat click
    elements.seatingChart.addEventListener('click', (e) => {
        const seat = e.target.closest('.seat');
        if (!seat) return;
        
        const index = parseInt(seat.dataset.index);
        handleSeatClick(index);
    });
    
    // Student modal events
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', closeModal);
    }
    elements.saveStudentBtn.addEventListener('click', saveStudentInfo);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.studentModal) {
            closeModal();
        }
        if (e.target === elements.templateModal) {
            elements.templateModal.style.display = 'none';
        }
    });
    
    // Template modal events
    if (elements.closeTemplateModal) {
        elements.closeTemplateModal.addEventListener('click', () => {
            elements.templateModal.style.display = 'none';
        });
    }
    elements.rowsInput.addEventListener('change', createTemplateGrid);
    elements.colsInput.addEventListener('change', createTemplateGrid);
    elements.parseExcelDataBtn.addEventListener('click', parseExcelData);
    elements.saveTemplateBtn.addEventListener('click', saveTemplate);
    elements.openTemplateModalBtn.addEventListener('click', () => {
        elements.templateModal.style.display = 'block';
    });
    
    // Delete class button event listener
    if (elements.deleteClassBtn) {
        console.log('반 삭제 버튼 이벤트 리스너 연결');
        elements.deleteClassBtn.addEventListener('click', deleteClass);
    } else {
        console.error('반 삭제 버튼을 찾을 수 없습니다.');
    }
    
    // 자리 배치에 바로 적용 버튼 이벤트 리스너
    if (elements.applyDirectlyBtn) {
        console.log('자리 배치에 바로 적용 버튼 이벤트 리스너 연결');
        elements.applyDirectlyBtn.addEventListener('click', applyDirectlyToSeating);
    } else {
        console.error('자리 배치에 바로 적용 버튼을 찾을 수 없습니다.');
    }
    
    console.log('이벤트 리스너 연결 완료!');
}

// Toggle edit mode
function toggleEditMode() {
    state.editMode = !state.editMode;
    elements.editModeBtn.textContent = state.editMode ? '편집 모드 종료' : '자리 배치 편집';
    elements.seatingChart.classList.toggle('edit-mode');
}

// Handle seat click
function handleSeatClick(index) {
    if (state.editMode) {
        // In edit mode, open modal to edit student info
        state.selectedSeatIndex = index;
        const seat = state.seats[index];
        
        elements.studentNameInput.value = seat.empty ? '' : seat.name;
        elements.studentNumberInput.value = seat.empty ? '' : seat.number;
        elements.attendanceStatusSelect.value = seat.status;
        
        elements.studentModal.style.display = 'block';
    } else {
        // In attendance mode, toggle attendance status with a single click
        if (!state.seats[index].empty) {
            state.seats[index].status = state.seats[index].status === 'present' ? 'absent' : 'present';
            updateSeatDisplay(index);
            updateAttendanceCounts();
        }
    }
}

// Save student information
function saveStudentInfo() {
    const index = state.selectedSeatIndex;
    const name = elements.studentNameInput.value.trim();
    const number = elements.studentNumberInput.value.trim();
    const status = elements.attendanceStatusSelect.value;
    
    if (name === '' && number === '') {
        // Empty seat
        state.seats[index] = {
            index,
            empty: true,
            name: '',
            number: '',
            status: 'present'
        };
    } else {
        // Occupied seat
        state.seats[index] = {
            index,
            empty: false,
            name,
            number,
            status
        };
    }
    
    updateSeatDisplay(index);
    updateAttendanceCounts();
    closeModal();
}

// Update seat display
function updateSeatDisplay(index) {
    const seat = state.seats[index];
    const seatElement = elements.seatingChart.children[index];
    
    if (seat.empty) {
        seatElement.className = 'seat empty';
        seatElement.innerHTML = '<div class="student-name">빈 자리</div>';
    } else {
        seatElement.className = `seat ${seat.status}`;
        seatElement.innerHTML = `
            <div class="student-name">${seat.name}</div>
            <div class="student-number">${seat.number}</div>
        `;
    }
}

// Update attendance counts
function updateAttendanceCounts() {
    const total = state.seats.filter(seat => !seat.empty).length;
    const absent = state.seats.filter(seat => !seat.empty && seat.status === 'absent').length;
    const present = total - absent;
    
    elements.totalCount.textContent = total;
    elements.presentCount.textContent = present;
    elements.absentCount.textContent = absent;
}

// Close the modal
function closeModal() {
    elements.studentModal.style.display = 'none';
}

// Submit attendance to Google Sheets
function submitAttendance() {
    console.log('출석 제출 시도 - 시작');
    
    // 로컬 스토리지 백업 항상 먼저 수행 (안전장치)
    backupToLocalStorage();
    
    // 인증 및 데이터 전송을 위한 함수 호출
    authenticateAndSubmit();
}

// 인증 및 제출을 처리하는 함수
function authenticateAndSubmit() {
    // 1. 데이터 준비
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const timeString = `${today.getHours()}:${today.getMinutes()}`;
    
    const absentStudents = state.seats.filter(seat => !seat.empty && seat.status === 'absent');
    
    if (absentStudents.length === 0) {
        alert('결석한 학생이 없습니다.');
        return;
    }
    
    const values = absentStudents.map(student => [
        dateString,
        timeString,
        state.currentClass,
        student.number,
        student.name,
        '결석'
    ]);
    
    // 시트 이름에 대한 올바른 범위 형식 지정 (시트명!A:F)
    const properRange = `${CONFIG.sheetName}!A:F`;
    
    // 2. GAPI 초기화
    if (typeof gapi === 'undefined') {
        console.error('GAPI가 정의되지 않았습니다. Google API 로드 실패.');
        alert('Google API 로드에 실패했습니다. 이미 로컬에 저장되었습니다.');
        return;
    }
    
    // 3. GAPI 클라이언트 로드
    gapi.load('client', async () => {
        try {
            console.log('GAPI 클라이언트 로드 성공');
            
            // 4. GAPI 클라이언트 초기화
            await gapi.client.init({
                apiKey: CONFIG.googleApiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });
            console.log('GAPI 클라이언트 초기화 성공');
            
            // 5. Google Identity Services 토큰 클라이언트 초기화
            if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
                throw new Error('Google Identity Services 로드 실패');
            }
            
            // 6. 토큰 획득 프로세스
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.clientId,
                scope: CONFIG.scopes,
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        console.error('GIS 토큰 획득 실패:', tokenResponse);
                        throw tokenResponse;
                    }
                    
                    console.log('GIS 토큰 획득 성공');
                    
                    try {
                        // 7. 토큰을 얻은 후 API 호출 실행
                        const requestData = {
                            spreadsheetId: CONFIG.spreadsheetId,
                            range: properRange,
                            valueInputOption: 'USER_ENTERED',
                            insertDataOption: 'INSERT_ROWS',
                            resource: { values: values }
                        };
                        
                        console.log('API 요청 데이터:', JSON.stringify(requestData, null, 2));
                        
                        const response = await gapi.client.sheets.spreadsheets.values.append(requestData);
                        
                        console.log('출석 정보 제출 성공:', response);
                        alert('출석 정보가 Google Sheets에 성공적으로 저장되었습니다.');
                    } catch (apiError) {
                        console.error('출석 정보 제출 실패:', apiError);
                        
                        // 더 자세한 오류 정보 확인
                        if (apiError.result && apiError.result.error) {
                            console.error('API 오류 세부 정보:', apiError.result.error);
                        }
                        
                        // 응답 본문 확인 시도
                        if (apiError.body) {
                            try {
                                const errorBody = JSON.parse(apiError.body);
                                console.error('오류 응답 본문:', errorBody);
                            } catch (e) {
                                console.error('오류 응답 본문(문자열):', apiError.body);
                            }
                        }
                        
                        // 대체 접근 방식: 시트 ID를 사용한 직접 fetch API 사용
                        console.log('대체 방식으로 시도: 시트 ID를 사용한 fetch API');
                        
                        try {
                            // Access Token 가져오기
                            const token = gapi.client.getToken();
                            if (!token) {
                                throw new Error('액세스 토큰이 없습니다.');
                            }
                            
                            // 시트 ID를 사용하는 방식 (시트 이름 대신)
                            // 첫 번째 시트는 보통 sheetId가 0입니다
                            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/Sheet1!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
                            
                            console.log('Fetch API URL:', url);
                            
                            const fetchResponse = await fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token.access_token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ values: values })
                            });
                            
                            if (!fetchResponse.ok) {
                                const errorText = await fetchResponse.text();
                                console.error(`Fetch API 오류 (${fetchResponse.status}): ${errorText}`);
                                
                                // 마지막 시도: 시트 이름 없이 단순 범위만 사용
                                console.log('최종 시도: 시트 이름 없이 단순 범위만 사용');
                                
                                const simpleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
                                
                                const finalResponse = await fetch(simpleUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token.access_token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ values: values })
                                });
                                
                                if (!finalResponse.ok) {
                                    const finalErrorText = await finalResponse.text();
                                    console.error(`최종 시도 오류 (${finalResponse.status}): ${finalErrorText}`);
                                    throw new Error(`최종 HTTP 오류 ${finalResponse.status}`);
                                }
                                
                                const finalData = await finalResponse.json();
                                console.log('최종 시도 성공:', finalData);
                                alert('출석 정보가 Google Sheets에 성공적으로 저장되었습니다.');
                                return;
                            }
                            
                            const data = await fetchResponse.json();
                            console.log('Fetch API 출석 정보 제출 성공:', data);
                            alert('출석 정보가 Google Sheets에 성공적으로 저장되었습니다.');
                            
                        } catch (fetchError) {
                            console.error('Fetch API 사용 시도 실패:', fetchError);
                            alert('모든 시도가 실패했습니다. Google Sheets 저장에 실패했습니다. 이미 로컬에 저장되었습니다.');
                        }
                    }
                }
            });
            
            // 8. 인증 토큰 요청 (콜백 함수 내에서 실제 API 호출이 이루어짐)
            console.log('인증 토큰 요청 중...');
            tokenClient.requestAccessToken({prompt: 'consent'});
            
        } catch (error) {
            console.error('인증 또는 초기화 실패:', error);
            
            if (error && error.error === 'popup_closed_by_user') {
                alert('Google 로그인 창이 닫혔습니다.');
            } else {
                alert('Google 인증에 실패했습니다. 이미 로컬에 저장되었습니다.');
            }
        }
    });
}

// 로컬 스토리지에 안전하게 백업 (오류와 무관하게 항상 실행)
function backupToLocalStorage() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const timeString = `${today.getHours()}:${today.getMinutes()}`;
    
    const absentStudents = state.seats.filter(seat => !seat.empty && seat.status === 'absent');
    
    if (absentStudents.length === 0) {
        console.log('결석한 학생이 없습니다.');
        return;
    }
    
    // 출석 데이터 생성
    const attendanceData = absentStudents.map(student => ({
        date: dateString,
        time: timeString,
        class: state.currentClass,
        number: student.number,
        name: student.name,
        status: '결석'
    }));
    
    // 로컬 스토리지에서 기존 출석 데이터 가져오기
    let savedAttendance = localStorage.getItem('attendance');
    let allAttendance = savedAttendance ? JSON.parse(savedAttendance) : [];
    
    // 새 출석 데이터 추가
    allAttendance = [...allAttendance, ...attendanceData];
    
    // 로컬 스토리지에 저장
    localStorage.setItem('attendance', JSON.stringify(allAttendance));
    
    console.log('출석 정보가 로컬에 백업되었습니다.');
    
    // 출석 데이터 콘솔에 출력 (디버깅용)
    console.table(attendanceData);
}

// 원래 함수는 backupToLocalStorage로 교체
function saveToLocalStorage() {
    alert('출석 정보가 로컬에 저장되었습니다.');
}

// Save seating arrangement
function saveSeatingArrangement() {
    if (!state.currentClass) {
        alert('반을 선택해주세요.');
        return;
    }
    
    const key = `seating-class-${state.currentClass}`;
    const data = {
        rows: state.rows,
        cols: state.cols,
        seats: state.seats
    };
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`${state.currentClass} 자리 배치 저장 완료:`, data);
    alert(`${state.currentClass} 자리 배치가 저장되었습니다.`);
}

// Load seating arrangement
function loadSeatingArrangement() {
    if (!state.currentClass) {
        console.log('로드할 반이 선택되지 않았습니다.');
        return;
    }
    
    const key = `seating-class-${state.currentClass}`;
    const savedData = localStorage.getItem(key);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log(`${state.currentClass} 자리 배치 로드 완료:`, data);
            
            // 행과 열 정보 업데이트
            state.rows = data.rows || 5;
            state.cols = data.cols || 6;
            
            // 자리 정보 업데이트
            state.seats = data.seats || [];
            
            // 자리 배치 다시 그리기
            renderSeatingChart();
            
            // 출석 상태 업데이트
            updateAttendanceCounts();
        } catch (error) {
            console.error('자리 배치 데이터 파싱 오류:', error);
            createEmptySeatingChart();
        }
    } else {
        console.log(`${state.currentClass} 반의 저장된 자리 배치가 없습니다.`);
        createEmptySeatingChart();
    }
}

// Delete class
function deleteClass() {
    const className = state.currentClass;
    
    if (!className) {
        alert('삭제할 반을 선택해주세요.');
        return;
    }
    
    // 사용자 확인
    if (!confirm(`${className} 반을 삭제하시겠습니까?`)) {
        return;
    }
    
    // 로컬 스토리지에서 반 데이터 삭제
    const key = `seating-class-${className}`;
    localStorage.removeItem(key);
    
    // 반 목록에서 제거
    const index = state.classes.indexOf(className);
    if (index !== -1) {
        state.classes.splice(index, 1);
        updateClassList();
    }
    
    // 현재 반 초기화
    state.currentClass = '';
    elements.classSelect.value = '';
    
    // 자리 배치 초기화
    createEmptySeatingChart();
    updateAttendanceCounts();
    
    alert(`${className} 반이 삭제되었습니다.`);
}

// Load class list
function loadClassList() {
    console.log('반 목록 로드 시작');
    const savedClasses = localStorage.getItem('class-list');
    
    if (savedClasses) {
        try {
            state.classes = JSON.parse(savedClasses);
            console.log('저장된 반 목록 로드 완료:', state.classes);
            
            // 현재 반 설정 (첫 번째 반 또는 이전에 선택한 반)
            const lastSelectedClass = localStorage.getItem('last-selected-class');
            if (lastSelectedClass && state.classes.includes(lastSelectedClass)) {
                state.currentClass = lastSelectedClass;
                elements.classSelect.value = lastSelectedClass;
                console.log('마지막 선택된 반으로 설정:', lastSelectedClass);
            } else if (state.classes.length > 0) {
                state.currentClass = state.classes[0];
                elements.classSelect.value = state.classes[0];
                console.log('첫 번째 반으로 설정:', state.classes[0]);
            }
        } catch (error) {
            console.error('반 목록 파싱 오류:', error);
            state.classes = [];
        }
    } else {
        console.log('저장된 반 목록이 없습니다.');
        state.classes = [];
    }
    
    updateClassList();
}

// Update class list in dropdown
function updateClassList() {
    console.log('반 목록 업데이트 시작');
    
    // 반 선택 드롭다운 업데이트
    elements.classSelect.innerHTML = '';
    
    // 빈 옵션 추가
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '반 선택';
    elements.classSelect.appendChild(emptyOption);
    
    // 반 목록 옵션 추가
    state.classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        elements.classSelect.appendChild(option);
    });
    
    // 현재 선택된 반 설정
    if (state.currentClass) {
        elements.classSelect.value = state.currentClass;
        localStorage.setItem('last-selected-class', state.currentClass);
    }
    
    // 템플릿 모달의 반 선택 입력란 초기화
    if (elements.classSelectTemplate) {
        elements.classSelectTemplate.value = state.currentClass || '';
    }
    
    console.log('반 목록 업데이트 완료');
}

// Add class to the list
function addClass(className) {
    console.log('반 추가 시작:', className);
    
    if (!className) return;
    
    // 이미 존재하는 반인지 확인
    if (!state.classes.includes(className)) {
        state.classes.push(className);
        localStorage.setItem('class-list', JSON.stringify(state.classes));
        console.log('반 추가 완료:', className);
    } else {
        console.log('이미 존재하는 반:', className);
    }
    
    updateClassList();
}

// Delete class from the list
function deleteClass() {
    console.log('반 삭제 시작');
    
    if (!state.currentClass) {
        alert('삭제할 반을 선택해주세요.');
        return;
    }
    
    if (confirm(`${state.currentClass} 반을 삭제하시겠습니까? 저장된 자리 배치 정보도 함께 삭제됩니다.`)) {
        // 반 목록에서 제거
        state.classes = state.classes.filter(c => c !== state.currentClass);
        localStorage.setItem('class-list', JSON.stringify(state.classes));
        
        // 저장된 자리 배치 정보 삭제
        localStorage.removeItem(`seating-class-${state.currentClass}`);
        
        // 현재 반 초기화
        state.currentClass = '';
        
        // 반 목록 업데이트
        updateClassList();
        
        // 빈 자리 배치 생성
        createEmptySeatingChart();
        
        console.log('반 삭제 완료');
        alert('반이 삭제되었습니다.');
    }
}

// 엑셀 데이터 파싱
function parseExcelData() {
    console.log('엑셀 데이터 파싱 시작');
    const excelData = elements.excelPasteArea.value.trim();
    if (!excelData) {
        alert('엑셀에서 복사한 데이터를 붙여넣어주세요.');
        return;
    }
    
    // 줄 단위로 분리
    const rows = excelData.split(/\r?\n/);
    
    // 각 줄을 탭 또는 여러 공백으로 분리
    const processedRows = rows.map(row => row.split(/\t|  +/));
    
    // 템플릿 그리드 크기 조정
    const maxCols = Math.max(...processedRows.map(row => row.length));
    elements.rowsInput.value = rows.length;
    elements.colsInput.value = maxCols;
    
    // 템플릿 그리드 다시 생성
    createTemplateGrid();
    
    // 데이터 채우기
    processedRows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.querySelector(`.template-cell[data-row="${rowIndex}"][data-col="${colIndex}"] input`);
            if (cellElement && cell) {
                cellElement.value = cell;
            }
        });
    });
    
    console.log('파싱된 데이터:', processedRows);
}

// 템플릿 저장
function saveTemplate() {
    console.log('템플릿 저장 시작');
    
    const selectedClass = elements.classSelectTemplate.value.trim();
    if (!selectedClass) {
        alert('반 이름을 입력해주세요.');
        return;
    }
    
    const rows = parseInt(elements.rowsInput.value);
    const cols = parseInt(elements.colsInput.value);
    
    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert('유효한 행과 열 수를 입력해주세요.');
        return;
    }
    
    // 템플릿 데이터 수집
    const seats = collectTemplateData(rows, cols);
    
    // 템플릿 저장
    const templateKey = `template-${selectedClass}`;
    const templateData = {
        rows,
        cols,
        seats
    };
    
    localStorage.setItem(templateKey, JSON.stringify(templateData));
    console.log('템플릿 저장 완료:', templateData);
    
    // 반 목록에 추가
    addClass(selectedClass);
    
    alert(`${selectedClass} 템플릿이 저장되었습니다.`);
}

// Collect template data from the grid
function collectTemplateData(rows, cols) {
    console.log('템플릿 데이터 수집 시작');
    const seats = [];
    const cells = elements.templateGrid.querySelectorAll('.template-cell');
    
    for (let i = 0; i < rows * cols; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const cell = cells[i];
        const input = cell.querySelector('input');
        const inputValue = input ? input.value.trim() : '';
        
        if (inputValue) {
            const [name, number] = parseStudentInfo(inputValue);
            
            seats.push({
                row: row,
                col: col,
                name: name || '',
                number: number || '',
                status: 'present' // 기본 상태는 출석으로 설정
            });
        } else {
            // 빈 입력값은 빈 자리로 처리
            seats.push({
                row: row,
                col: col,
                name: '',
                number: '',
                status: 'empty'
            });
        }
    }
    
    console.log('템플릿 데이터 수집 완료:', seats);
    return seats;
}

// Parse student info from input (e.g. "홍길동 12" -> ["홍길동", "12"])
function parseStudentInfo(input) {
    const parts = input.trim().split(/\s+/);
    
    if (parts.length >= 2) {
        const number = parts[parts.length - 1];
        const name = parts.slice(0, parts.length - 1).join(' ');
        return [name, number];
    } else {
        return [input, ''];
    }
}

// Parse Excel data
function parseExcelData() {
    console.log('엑셀 데이터 파싱 시작');
    const pasteData = elements.excelPasteArea.value.trim();
    
    if (!pasteData) {
        alert('엑셀 데이터를 붙여넣어 주세요.');
        return;
    }
    
    // 행 단위로 분리
    const rows = pasteData.split(/\r?\n/);
    const rowCount = parseInt(elements.rowsInput.value);
    const colCount = parseInt(elements.colsInput.value);
    
    // 템플릿 그리드 초기화
    createTemplateGrid();
    
    // 데이터 채우기
    const cells = elements.templateGrid.querySelectorAll('.template-cell');
    
    // 모든 셀 초기화 (빈 자리로)
    cells.forEach(cell => {
        const input = cell.querySelector('input');
        if (input) {
            input.value = '';
        }
    });
    
    // 엑셀 데이터 적용
    for (let r = 0; r < Math.min(rows.length, rowCount); r++) {
        // 탭으로 열 분리
        const columns = rows[r].split(/\t/);
        
        for (let c = 0; c < Math.min(columns.length, colCount); c++) {
            const cellIndex = r * colCount + c;
            const cellData = columns[c].trim();
            
            if (cellIndex < cells.length) {
                const input = cells[cellIndex].querySelector('input');
                if (input) {
                    // 빈 칸은 그대로 빈 자리로 유지
                    input.value = cellData;
                }
            }
        }
    }
    
    console.log('엑셀 데이터 파싱 완료');
    alert('엑셀 데이터가 파싱되었습니다.');
}

// 자리 배치에 바로 적용
function applyDirectlyToSeating() {
    console.log('자리 배치에 바로 적용 함수 실행');
    console.log('버튼 요소 확인:', elements.applyDirectlyBtn);
    
    const selectedClass = elements.classSelectTemplate.value.trim();
    if (!selectedClass) {
        alert('반을 입력해주세요.');
        return;
    }
    
    const rows = parseInt(elements.rowsInput.value);
    const cols = parseInt(elements.colsInput.value);
    
    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert('유효한 행과 열 수를 입력해주세요.');
        return;
    }
    
    // 템플릿 데이터 수집
    const seats = collectTemplateData(rows, cols);
    
    // 반 목록에 추가
    addClass(selectedClass);
    
    // 현재 반 정보 업데이트
    elements.classSelect.value = selectedClass;
    state.currentClass = selectedClass;
    
    // 템플릿 적용
    state.rows = rows;
    state.cols = cols;
    state.seats = seats;
    
    // 자리 배치 다시 그리기
    renderSeatingChart();
    
    // 출석 상태 업데이트
    updateAttendanceCounts();
    
    // 현재 반에 대한 자리 배치 저장
    saveSeatingArrangement();
    
    // 모달 닫기
    elements.templateModal.style.display = 'none';
    
    console.log('자리 배치에 바로 적용 완료');
    alert(`${selectedClass} 자리 배치가 적용되었습니다.`);
}

// 자리 배치 차트 렌더링
function renderSeatingChart() {
    console.log('자리 배치 차트 렌더링 시작');
    console.log('현재 상태:', {
        rows: state.rows,
        cols: state.cols,
        seats: state.seats
    });
    
    // 자리 배치 컨테이너 초기화
    elements.seatingChart.innerHTML = '';
    
    // 그리드 스타일 설정
    elements.seatingChart.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
    elements.seatingChart.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
    
    // 자리 생성
    for (let i = 0; i < state.rows * state.cols; i++) {
        const row = Math.floor(i / state.cols);
        const col = i % state.cols;
        
        // 해당 위치의 자리 정보 찾기
        const seatInfo = state.seats.find(seat => seat.row === row && seat.col === col);
        
        // 자리 요소 생성
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.index = i;
        seat.dataset.row = row;
        seat.dataset.col = col;
        
        // 자리 정보가 있는 경우
        if (seatInfo) {
            // 학생 이름 표시
            let nameDisplay = '빈 자리';
            if (seatInfo.name) {
                nameDisplay = seatInfo.name;
                if (seatInfo.number) {
                    nameDisplay += ` (${seatInfo.number})`;
                }
            }
            
            // 출석 상태에 따른 클래스 추가
            if (seatInfo.status === 'absent') {
                seat.classList.add('absent');
            } else if (seatInfo.status === 'empty') {
                seat.classList.add('empty');
            } else {
                seat.classList.add('present');
            }
            
            // 자리 내용 설정
            seat.innerHTML = `<div class="student-name">${nameDisplay}</div>`;
            
            // 상태 정보 저장
            seat.dataset.status = seatInfo.status;
            seat.dataset.name = seatInfo.name || '';
            seat.dataset.number = seatInfo.number || '';
        } else {
            // 자리 정보가 없는 경우 빈 자리로 설정
            seat.classList.add('empty');
            seat.innerHTML = '<div class="student-name">빈 자리</div>';
            seat.dataset.status = 'empty';
        }
        
        // 자리 요소 추가
        elements.seatingChart.appendChild(seat);
    }
    
    console.log('자리 배치 차트 렌더링 완료');
}

// 템플릿 그리드 생성
function createTemplateGrid() {
    elements.templateGrid.innerHTML = '';
    const rows = parseInt(elements.rowsInput.value);
    const cols = parseInt(elements.colsInput.value);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'template-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'student-input';
            input.placeholder = '학번 이름';
            
            cell.appendChild(input);
            elements.templateGrid.appendChild(cell);
        }
    }
    
    elements.templateGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
