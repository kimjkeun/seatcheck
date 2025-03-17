// Configuration
const CONFIG = {
    rows: 7,
    cols: 5,
    googleApiKey: '', // Add your Google API key here
    spreadsheetId: '', // Add your Google Spreadsheet ID here
    sheetName: '출석부'
};

// State
let state = {
    editMode: false,
    currentClass: '1',
    seats: [],
    currentSeatIndex: null
};

// DOM Elements
const elements = {
    classSelect: document.getElementById('class-select'),
    editModeBtn: document.getElementById('edit-mode-btn'),
    saveBtn: document.getElementById('save-btn'),
    loadBtn: document.getElementById('load-btn'),
    downloadTemplateBtn: document.getElementById('download-template-btn'),
    uploadTemplateBtn: document.getElementById('upload-template-btn'),
    templateUpload: document.getElementById('template-upload'),
    seatingChart: document.getElementById('seating-chart'),
    totalCount: document.getElementById('total-count'),
    presentCount: document.getElementById('present-count'),
    absentCount: document.getElementById('absent-count'),
    submitAttendanceBtn: document.getElementById('submit-attendance-btn'),
    studentModal: document.getElementById('student-modal'),
    closeModalBtn: document.querySelector('.close'),
    studentNameInput: document.getElementById('student-name'),
    studentNumberInput: document.getElementById('student-number'),
    attendanceStatusSelect: document.getElementById('attendance-status-select'),
    saveStudentBtn: document.getElementById('save-student-btn')
};

// Initialize the application
function init() {
    createEmptySeatingChart();
    attachEventListeners();
    loadSeatingArrangement();
    updateAttendanceCounts();
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
    // Class selection
    elements.classSelect.addEventListener('change', (e) => {
        state.currentClass = e.target.value;
        loadSeatingArrangement();
    });
    
    // Edit mode toggle
    elements.editModeBtn.addEventListener('click', toggleEditMode);
    
    // Save and load buttons
    elements.saveBtn.addEventListener('click', saveSeatingArrangement);
    elements.loadBtn.addEventListener('click', loadSeatingArrangement);
    
    // Template download and upload
    elements.downloadTemplateBtn.addEventListener('click', downloadTemplate);
    elements.uploadTemplateBtn.addEventListener('click', () => {
        elements.templateUpload.click();
    });
    elements.templateUpload.addEventListener('change', uploadTemplate);
    
    // Seat click
    elements.seatingChart.addEventListener('click', (e) => {
        const seat = e.target.closest('.seat');
        if (!seat) return;
        
        const index = parseInt(seat.dataset.index);
        handleSeatClick(index);
    });
    
    // Submit attendance
    elements.submitAttendanceBtn.addEventListener('click', submitAttendance);
    
    // Modal events
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.saveStudentBtn.addEventListener('click', saveStudentInfo);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.studentModal) {
            closeModal();
        }
    });
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
        state.currentSeatIndex = index;
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
    const index = state.currentSeatIndex;
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

// Download template
function downloadTemplate() {
    // Create worksheet data
    const wsData = [
        ['반', '자리 번호', '이름', '학번', '출석 상태'],
    ];
    
    // Add seat data
    state.seats.forEach((seat, index) => {
        if (!seat.empty) {
            wsData.push([
                state.currentClass,
                index + 1,
                seat.name,
                seat.number,
                seat.status === 'present' ? '출석' : '결석'
            ]);
        }
    });
    
    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '자리 배치');
    
    // Generate Excel file
    const fileName = `seating-template-class-${state.currentClass}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Upload template
function uploadTemplate(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Read the Excel file
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first worksheet
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            
            // Convert to JSON
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Skip the header row
            if (rows.length <= 1) {
                alert('템플릿 파일에 데이터가 없습니다.');
                return;
            }
            
            // Create a new empty seating chart
            createEmptySeatingChart();
            
            // Process each row (skip header)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (row.length >= 5) {
                    const classValue = row[0].toString();
                    const seatIndex = parseInt(row[1]) - 1;
                    const name = row[2].toString();
                    const number = row[3].toString();
                    const status = row[4] === '결석' ? 'absent' : 'present';
                    
                    // Update class if needed
                    if (i === 1 && classValue) {
                        state.currentClass = classValue;
                        elements.classSelect.value = classValue;
                    }
                    
                    // Update seat if valid index
                    if (seatIndex >= 0 && seatIndex < state.seats.length) {
                        state.seats[seatIndex] = {
                            index: seatIndex,
                            empty: false,
                            name,
                            number,
                            status
                        };
                        
                        updateSeatDisplay(seatIndex);
                    }
                }
            }
            
            updateAttendanceCounts();
            saveSeatingArrangement();
            
            alert('템플릿이 성공적으로 업로드되었습니다.');
        } catch (error) {
            console.error('Error parsing template:', error);
            alert('템플릿 파일을 읽는 중 오류가 발생했습니다.');
        }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset the file input
    event.target.value = '';
}

// Save seating arrangement
function saveSeatingArrangement() {
    const key = `seating-class-${state.currentClass}`;
    localStorage.setItem(key, JSON.stringify(state.seats));
    alert(`${state.currentClass}반 자리 배치가 저장되었습니다.`);
}

// Load seating arrangement
function loadSeatingArrangement() {
    const key = `seating-class-${state.currentClass}`;
    const savedSeats = localStorage.getItem(key);
    
    if (savedSeats) {
        state.seats = JSON.parse(savedSeats);
        
        // Update the display
        state.seats.forEach((seat, index) => {
            updateSeatDisplay(index);
        });
        
        updateAttendanceCounts();
    } else {
        createEmptySeatingChart();
    }
}

// Submit attendance to Google Sheets
function submitAttendance() {
    if (!gapi.client) {
        initGoogleApi().then(() => {
            sendAttendanceData();
        }).catch(error => {
            console.error('Google API initialization failed:', error);
            alert('Google API 초기화에 실패했습니다. 다시 시도해주세요.');
        });
    } else {
        sendAttendanceData();
    }
}

// Initialize Google API
function initGoogleApi() {
    return new Promise((resolve, reject) => {
        gapi.load('client', () => {
            gapi.client.init({
                apiKey: CONFIG.googleApiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            }).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    });
}

// Send attendance data to Google Sheets
function sendAttendanceData() {
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
    
    const body = {
        values: values
    };
    
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: CONFIG.spreadsheetId,
        range: CONFIG.sheetName,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: body
    }).then(response => {
        alert('출석 정보가 성공적으로 제출되었습니다.');
    }).catch(error => {
        console.error('Error submitting attendance:', error);
        alert('출석 정보 제출에 실패했습니다. 다시 시도해주세요.');
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
