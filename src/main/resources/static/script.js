/**
 * Student Management System - Frontend Controller
 * Uses Vanilla JavaScript fetch() to communicate with Spring Boot REST API
 */

// API Base URL
const API_BASE_URL = '/api/students';

// Application State
let studentsList = [];
let studentToDelete = null;

// DOM Elements Cache
const elements = {
    // Summary counters
    totalStudentsCount: document.getElementById('totalStudentsCount'),
    totalCoursesCount: document.getElementById('totalCoursesCount'),

    // Search and filter
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    courseFilter: document.getElementById('courseFilter'),
    refreshBtn: document.getElementById('refreshBtn'),

    // Table & States
    studentsTable: document.getElementById('studentsTable'),
    studentsTableBody: document.getElementById('studentsTableBody'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),

    // Add / Edit Modal
    studentModal: document.getElementById('studentModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),
    emptyAddBtn: document.getElementById('emptyAddBtn'),
    studentForm: document.getElementById('studentForm'),
    studentId: document.getElementById('studentId'),
    studentName: document.getElementById('studentName'),
    studentEmail: document.getElementById('studentEmail'),
    studentCourse: document.getElementById('studentCourse'),
    studentAge: document.getElementById('studentAge'),
    saveBtnText: document.getElementById('saveBtnText'),
    saveStudentBtn: document.getElementById('saveStudentBtn'),

    // Field errors
    nameError: document.getElementById('nameError'),
    emailError: document.getElementById('emailError'),
    courseError: document.getElementById('courseError'),
    ageError: document.getElementById('ageError'),

    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteStudentName: document.getElementById('deleteStudentName'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    fetchStudents();
});

// ==========================================
// Event Listeners
// ==========================================
function bindEvents() {
    // Open Add Modal
    elements.openAddModalBtn.addEventListener('click', () => openStudentModal());
    elements.emptyAddBtn.addEventListener('click', () => openStudentModal());

    // Close Modals
    elements.closeModalBtn.addEventListener('click', closeStudentModal);
    elements.cancelModalBtn.addEventListener('click', closeStudentModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    // Close on overlay backdrop click
    elements.studentModal.addEventListener('click', (e) => {
        if (e.target === elements.studentModal) closeStudentModal();
    });
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) closeDeleteModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeStudentModal();
            closeDeleteModal();
        }
    });

    // Form Submit (Add or Edit)
    elements.studentForm.addEventListener('submit', handleFormSubmit);

    // Confirm Delete
    elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Search Input
    elements.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        elements.clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';
        filterAndRenderStudents();
    });

    // Clear Search Button
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        filterAndRenderStudents();
        elements.searchInput.focus();
    });

    // Course Filter Dropdown - Demonstrates GET /api/students/course/{course}
    elements.courseFilter.addEventListener('change', () => {
        const selectedCourse = elements.courseFilter.value;
        if (selectedCourse) {
            fetchStudentsByCourse(selectedCourse);
        } else {
            fetchStudents();
        }
    });

    // Refresh & Retry Buttons
    elements.refreshBtn.addEventListener('click', () => {
        elements.courseFilter.value = '';
        elements.searchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        fetchStudents();
    });

    elements.retryBtn.addEventListener('click', fetchStudents);
}

// ==========================================
// API Calls via Fetch
// ==========================================

/**
 * 1. GET /api/students - Fetch all student records
 */
async function fetchStudents() {
    showLoadingState();
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }
        studentsList = await response.json();
        updateSummaryCards(studentsList);
        updateCourseDropdownOptions(studentsList);
        filterAndRenderStudents();
    } catch (error) {
        console.error('Error fetching students:', error);
        showErrorState(error.message);
    }
}

/**
 * 2. GET /api/students/course/{course} - Fetch students by course endpoint
 */
async function fetchStudentsByCourse(course) {
    showLoadingState();
    try {
        const response = await fetch(`${API_BASE_URL}/course/${encodeURIComponent(course)}`);
        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }
        studentsList = await response.json();
        filterAndRenderStudents();
    } catch (error) {
        console.error(`Error fetching students in course ${course}:`, error);
        showToast(`Failed to filter by course: ${error.message}`, 'error');
        showErrorState(error.message);
    }
}

/**
 * 3. GET /api/students/{id} - Fetch single student details for editing
 */
async function fetchStudentById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Student not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching student details:', error);
        showToast(error.message || 'Failed to fetch student details', 'error');
        return null;
    }
}

/**
 * Form Submit: Handles POST /api/students (Create) or PUT /api/students/{id} (Update)
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    clearFieldErrors();

    const id = elements.studentId.value;
    const name = elements.studentName.value.trim();
    const email = elements.studentEmail.value.trim();
    const course = elements.studentCourse.value.trim();
    const age = parseInt(elements.studentAge.value, 10);

    // Client-side Validation
    let hasError = false;
    if (!name) {
        setFieldError('nameError', 'Full name is required');
        hasError = true;
    }
    if (!email) {
        setFieldError('emailError', 'Email address is required');
        hasError = true;
    } else if (!isValidEmail(email)) {
        setFieldError('emailError', 'Please enter a valid email address');
        hasError = true;
    }
    if (!course) {
        setFieldError('courseError', 'Course is required');
        hasError = true;
    }
    if (isNaN(age) || age <= 0 || age > 120) {
        setFieldError('ageError', 'Please enter a valid age between 1 and 120');
        hasError = true;
    }

    if (hasError) return;

    const payload = { name, email, course, age };
    const isEdit = Boolean(id);

    setButtonLoading(elements.saveStudentBtn, true, isEdit ? 'Updating...' : 'Saving...');

    try {
        const url = isEdit ? `${API_BASE_URL}/${id}` : API_BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = data && data.message ? data.message : `Error (${response.status}): Failed to save`;
            throw new Error(errorMsg);
        }

        closeStudentModal();
        showToast(isEdit ? 'Student updated successfully!' : 'Student added successfully!', 'success');
        
        // Refresh student records
        fetchStudents();
    } catch (error) {
        console.error('Save error:', error);
        showToast(error.message, 'error');
        if (error.message.toLowerCase().includes('email')) {
            setFieldError('emailError', error.message);
        }
    } finally {
        setButtonLoading(elements.saveStudentBtn, false, isEdit ? 'Update Student' : 'Save Student');
    }
}

/**
 * Handle Delete: Calls DELETE /api/students/{id}
 */
async function handleConfirmDelete() {
    if (!studentToDelete) return;

    setButtonLoading(elements.confirmDeleteBtn, true, 'Deleting...');

    try {
        const response = await fetch(`${API_BASE_URL}/${studentToDelete.id}`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 204) {
            const data = await response.json().catch(() => null);
            throw new Error(data?.message || 'Failed to delete student');
        }

        closeDeleteModal();
        showToast(`Student "${studentToDelete.name}" deleted successfully.`, 'success');
        fetchStudents();
    } catch (error) {
        console.error('Delete error:', error);
        showToast(error.message, 'error');
    } finally {
        setButtonLoading(elements.confirmDeleteBtn, false, 'Delete');
    }
}

// ==========================================
// Rendering & UI State Management
// ==========================================

function filterAndRenderStudents() {
    const searchQuery = elements.searchInput.value.trim().toLowerCase();

    // Filter by name or email
    let filtered = studentsList;
    if (searchQuery) {
        filtered = filtered.filter(student =>
            (student.name && student.name.toLowerCase().includes(searchQuery)) ||
            (student.email && student.email.toLowerCase().includes(searchQuery))
        );
    }

    renderTable(filtered);
}

function renderTable(students) {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';

    if (!students || students.length === 0) {
        elements.studentsTable.style.display = 'none';
        elements.emptyState.style.display = 'flex';

        if (elements.searchInput.value.trim()) {
            elements.emptyStateTitle.textContent = 'No Matching Records';
            elements.emptyStateDesc.textContent = 'Try adjusting your search query or clear the filter.';
            elements.emptyAddBtn.style.display = 'none';
        } else {
            elements.emptyStateTitle.textContent = 'No Students Found';
            elements.emptyStateDesc.textContent = 'Get started by adding your first student record to the system.';
            elements.emptyAddBtn.style.display = 'inline-flex';
        }
        return;
    }

    elements.emptyState.style.display = 'none';
    elements.studentsTable.style.display = 'table';
    elements.studentsTableBody.innerHTML = '';

    students.forEach(student => {
        const tr = document.createElement('tr');

        // Generate initials for avatar circle
        const initials = student.name
            ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'ST';

        tr.innerHTML = `
            <td><span class="student-id">#${student.id}</span></td>
            <td>
                <div class="student-name-cell">
                    <div class="avatar-circle">${escapeHtml(initials)}</div>
                    <span class="student-name">${escapeHtml(student.name)}</span>
                </div>
            </td>
            <td><span class="student-email">${escapeHtml(student.email)}</span></td>
            <td><span class="course-badge">${escapeHtml(student.course)}</span></td>
            <td><span class="student-age">${student.age} yrs</span></td>
            <td class="text-right">
                <div class="action-buttons">
                    <button class="btn-icon" title="Edit Student" onclick="onEditStudentClick(${student.id})">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-delete" title="Delete Student" onclick="onDeleteStudentClick(${student.id})">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        elements.studentsTableBody.appendChild(tr);
    });
}

function updateSummaryCards(students) {
    // Total Students
    elements.totalStudentsCount.textContent = students.length;

    // Total Unique Courses
    const courses = new Set(
        students
            .map(s => s.course ? s.course.trim().toLowerCase() : '')
            .filter(Boolean)
    );
    elements.totalCoursesCount.textContent = courses.size;
}

function updateCourseDropdownOptions(students) {
    const currentSelection = elements.courseFilter.value;
    const uniqueCourses = Array.from(
        new Set(students.map(s => s.course ? s.course.trim() : '').filter(Boolean))
    ).sort();

    // Preserve "All Courses"
    elements.courseFilter.innerHTML = '<option value="">All Courses</option>';

    uniqueCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        if (course.toLowerCase() === currentSelection.toLowerCase()) {
            option.selected = true;
        }
        elements.courseFilter.appendChild(option);
    });
}

function showLoadingState() {
    elements.loadingState.style.display = 'flex';
    elements.emptyState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.studentsTable.style.display = 'none';
}

function showErrorState(message) {
    elements.loadingState.style.display = 'none';
    elements.emptyState.style.display = 'none';
    elements.studentsTable.style.display = 'none';
    elements.errorState.style.display = 'flex';
    if (message) {
        elements.errorMessage.textContent = message;
    }
}

// ==========================================
// Modal Handlers (Add, Edit, Delete)
// ==========================================

async function openStudentModal(student = null) {
    clearFieldErrors();
    elements.studentForm.reset();

    if (student) {
        elements.modalTitle.textContent = 'Edit Student Details';
        elements.saveBtnText.textContent = 'Update Student';
        elements.studentId.value = student.id;
        elements.studentName.value = student.name || '';
        elements.studentEmail.value = student.email || '';
        elements.studentCourse.value = student.course || '';
        elements.studentAge.value = student.age || '';
    } else {
        elements.modalTitle.textContent = 'Add New Student';
        elements.saveBtnText.textContent = 'Save Student';
        elements.studentId.value = '';
    }

    elements.studentModal.classList.add('active');
    elements.studentName.focus();
}

function closeStudentModal() {
    elements.studentModal.classList.remove('active');
    clearFieldErrors();
}

// Window globally accessible edit/delete hooks for table row buttons
window.onEditStudentClick = async function(id) {
    // Attempt to locate in local list first or fetch by ID
    let student = studentsList.find(s => s.id === id);
    if (!student) {
        student = await fetchStudentById(id);
    }
    if (student) {
        openStudentModal(student);
    }
};

window.onDeleteStudentClick = function(id) {
    const student = studentsList.find(s => s.id === id);
    if (!student) return;

    studentToDelete = student;
    elements.deleteStudentName.textContent = student.name;
    elements.deleteModal.classList.add('active');
};

function closeDeleteModal() {
    elements.deleteModal.classList.remove('active');
    studentToDelete = null;
}

// ==========================================
// Toast Notification System
// ==========================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `
            <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;
    } else {
        iconSvg = `
            <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

// ==========================================
// Helper Utilities
// ==========================================
function setFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

function clearFieldErrors() {
    ['nameError', 'emailError', 'courseError', 'ageError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setButtonLoading(button, isLoading, text) {
    if (button) {
        button.disabled = isLoading;
        const textSpan = button.querySelector('span');
        if (textSpan) {
            textSpan.textContent = text;
        } else {
            button.textContent = text;
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
