/**
 * AITools - Admin Submissions Management JavaScript
 * Handles submission approval, rejection, and filtering with live Supabase database
 * @version 1.0.0
 * @date 2025-07-22
 * @author Pranay Kumar
 */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentPage = 1;
    let currentFilters = {
        status: 'pending',
        category: 'all',
        dateFilter: 'all',
        search: ''
    };
    let selectedSubmissions = new Set();
    let allSubmissions = [];
    let currentSubmissionId = null;
    
    // Cache DOM elements
    const elements = {
        // Filters
        statusFilter: document.getElementById('status-filter'),
        categoryFilter: document.getElementById('category-filter'),
        dateFilter: document.getElementById('date-filter'),
        searchInput: document.getElementById('admin-search-input'),
        
        // Action buttons
        approveSelectedBtn: document.getElementById('approve-selected-btn'),
        rejectSelectedBtn: document.getElementById('reject-selected-btn'),
        selectAllCheckbox: document.getElementById('select-all-checkbox'),
        
        // Table and pagination
        submissionsTable: document.getElementById('submissions-table'),
        pagination: document.getElementById('pagination'),
        
        // Modals
        submissionModal: document.getElementById('submission-modal'),
        rejectModal: document.getElementById('reject-modal'),
        overlay: document.getElementById('overlay'),
        
        // Modal elements
        modalTitle: document.getElementById('modal-title'),
        submissionDetails: document.getElementById('submission-details'),
        closeModal: document.getElementById('close-modal'),
        closeDetailsBtn: document.getElementById('close-details-btn'),
        approveBtn: document.getElementById('approve-btn'),
        rejectBtn: document.getElementById('reject-btn'),
        
        // Reject modal elements
        closeRejectModal: document.getElementById('close-reject-modal'),
        rejectReason: document.getElementById('reject-reason'),
        cancelRejectBtn: document.getElementById('cancel-reject-btn'),
        confirmRejectBtn: document.getElementById('confirm-reject-btn'),
        
        // Sidebar and menu
        toggleSidebar: document.getElementById('toggle-sidebar'),
        sidebar: document.querySelector('.admin-sidebar'),
        closeSidebar: document.getElementById('close-sidebar'),
        
        // Notifications
        notificationBtn: document.getElementById('notification-btn'),
        notificationDropdown: document.getElementById('notification-dropdown'),
        notificationBadge: document.getElementById('notification-badge'),
        markAllRead: document.getElementById('mark-all-read'),
        submissionsBadge: document.getElementById('submissions-badge')
    };
    
    // Initialize
    setupEventListeners();
    loadCategories();
    fetchSubmissions();
    fetchNotifications(); // Add notification fetching
    
    // Set up periodic notification refresh (every 30 seconds)
    setInterval(fetchNotifications, 30000);
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Filters
        if (elements.statusFilter) {
            elements.statusFilter.addEventListener('change', handleFilterChange);
        }
        if (elements.categoryFilter) {
            elements.categoryFilter.addEventListener('change', handleFilterChange);
        }
        if (elements.dateFilter) {
            elements.dateFilter.addEventListener('change', handleFilterChange);
        }
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', debounce(handleSearchChange, 300));
        }
        
        // Bulk actions
        if (elements.selectAllCheckbox) {
            elements.selectAllCheckbox.addEventListener('change', handleSelectAll);
        }
        if (elements.approveSelectedBtn) {
            elements.approveSelectedBtn.addEventListener('click', handleApproveSelected);
        }
        if (elements.rejectSelectedBtn) {
            elements.rejectSelectedBtn.addEventListener('click', handleRejectSelected);
        }
        
        // Modal events
        if (elements.closeModal) {
            elements.closeModal.addEventListener('click', closeSubmissionModal);
        }
        if (elements.closeDetailsBtn) {
            elements.closeDetailsBtn.addEventListener('click', closeSubmissionModal);
        }
        if (elements.approveBtn) {
            elements.approveBtn.addEventListener('click', handleApproveFromModal);
        }
        if (elements.rejectBtn) {
            elements.rejectBtn.addEventListener('click', handleRejectFromModal);
        }
        
        // Reject modal events
        if (elements.closeRejectModal) {
            elements.closeRejectModal.addEventListener('click', closeRejectModal);
        }
        if (elements.cancelRejectBtn) {
            elements.cancelRejectBtn.addEventListener('click', closeRejectModal);
        }
        if (elements.confirmRejectBtn) {
            elements.confirmRejectBtn.addEventListener('click', handleConfirmReject);
        }
        
        // Close modals on overlay click
        if (elements.overlay) {
            elements.overlay.addEventListener('click', () => {
                closeSubmissionModal();
                closeRejectModal();
            });
        }
        
        // Sidebar toggle
        if (elements.toggleSidebar && elements.sidebar) {
            elements.toggleSidebar.addEventListener('click', () => {
                elements.sidebar.classList.toggle('active');
                if (elements.overlay) elements.overlay.classList.toggle('active');
            });
        }
        
        if (elements.closeSidebar && elements.sidebar) {
            elements.closeSidebar.addEventListener('click', () => {
                elements.sidebar.classList.remove('active');
                if (elements.overlay) elements.overlay.classList.remove('active');
            });
        }
        
        // Notifications dropdown
        if (elements.notificationBtn) {
            elements.notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (elements.notificationDropdown) {
                    elements.notificationDropdown.classList.toggle('active');
                }
            });
        }
        
        // Mark all notifications as read
        if (elements.markAllRead) {
            elements.markAllRead.addEventListener('click', markAllNotificationsAsRead);
        }
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.notificationBtn && elements.notificationDropdown && 
                !elements.notificationBtn.contains(e.target) && 
                !elements.notificationDropdown.contains(e.target)) {
                elements.notificationDropdown.classList.remove('active');
            }
        });
    }
    
    /**
     * Load categories for filter dropdown
     */
    async function loadCategories() {
        try {
            const response = await fetch('/api/admin/categories');
            const data = await response.json();
            
            if (data.success && data.categories && elements.categoryFilter) {
                // Clear existing options except "All Categories"
                while (elements.categoryFilter.children.length > 1) {
                    elements.categoryFilter.removeChild(elements.categoryFilter.lastChild);
                }
                
                // Add categories
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    elements.categoryFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    /**
     * Fetch submissions from API
     */
    async function fetchSubmissions() {
        try {
            showLoading();
            
            const params = new URLSearchParams({
                page: currentPage,
                status: currentFilters.status,
                category: currentFilters.category,
                dateFilter: currentFilters.dateFilter,
                limit: 10
            });
            
            if (currentFilters.search) {
                params.append('search', currentFilters.search);
            }
            
            const response = await fetch(`/api/admin/submissions?${params}`);
            const data = await response.json();
            
            if (data.success) {
                allSubmissions = data.submissions || [];
                renderSubmissionsTable();
                renderPagination(data.totalPages || 1, data.currentPage || 1);
            } else {
                throw new Error('Failed to fetch submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            showError('Failed to load submissions');
            
            // Fallback to mock data
            allSubmissions = getMockSubmissions();
            renderSubmissionsTable();
            renderPagination(1, 1);
        }
    }
    
    /**
     * Render submissions table
     */
    function renderSubmissionsTable() {
        if (!elements.submissionsTable) return;
        
        if (allSubmissions.length === 0) {
            elements.submissionsTable.innerHTML = `
                <tr class="no-data-row">
                    <td colspan="7">
                        <div class="no-data">
                            <span class="material-icons-outlined">inbox</span>
                            <p>No submissions found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        const submissionsHTML = allSubmissions.map(submission => createSubmissionRow(submission)).join('');
        elements.submissionsTable.innerHTML = submissionsHTML;
        
        // Add event listeners to checkboxes and action buttons
        document.querySelectorAll('.submission-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleSubmissionSelect);
        });
        
        document.querySelectorAll('.view-submission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const submissionId = parseInt(e.target.closest('[data-id]').getAttribute('data-id'));
                showSubmissionDetails(submissionId);
            });
        });
        
        document.querySelectorAll('.approve-submission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const submissionId = parseInt(e.target.closest('[data-id]').getAttribute('data-id'));
                approveSubmission([submissionId]);
            });
        });
        
        document.querySelectorAll('.reject-submission-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const submissionId = parseInt(e.target.closest('[data-id]').getAttribute('data-id'));
                currentSubmissionId = submissionId;
                if (elements.rejectModal && elements.overlay) {
                    elements.rejectModal.classList.add('active');
                    elements.overlay.classList.add('active');
                }
            });
        });
        
        updateBulkActionButtons();
    }
    
    /**
     * Create HTML for submission row
     */
    function createSubmissionRow(submission) {
        const statusClass = getStatusClass(submission.status);
        const date = formatDate(submission.created_at);
        
        return `
            <tr data-id="${submission.id}">
                <td>
                    <input type="checkbox" class="submission-checkbox" value="${submission.id}">
                </td>
                <td>
                    <div class="tool-info">
                        <h3 class="tool-name">${submission.name}</h3>
                        <p class="tool-description">${truncateText(submission.description || '', 60)}</p>
                    </div>
                </td>
                <td>
                    <span class="category-badge">${submission.category}</span>
                </td>
                <td>
                    <div class="contributor-info">
                        <span class="contributor-name">${submission.contributor_name || 'Anonymous'}</span>
                        <span class="contributor-email">${submission.contributor_email || ''}</span>
                    </div>
                </td>
                <td>${date}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${capitalizeFirstLetter(submission.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn view-submission-btn" data-id="${submission.id}" title="View Details">
                            <span class="material-icons-outlined">visibility</span>
                        </button>
                        ${submission.status === 'pending' ? `
                            <button class="action-btn approve-btn approve-submission-btn" data-id="${submission.id}" title="Approve">
                                <span class="material-icons-outlined">check_circle</span>
                            </button>
                            <button class="action-btn reject-btn reject-submission-btn" data-id="${submission.id}" title="Reject">
                                <span class="material-icons-outlined">cancel</span>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }
    
    /**
     * Handle filter changes
     */
    function handleFilterChange() {
        currentFilters.status = elements.statusFilter?.value || 'pending';
        currentFilters.category = elements.categoryFilter?.value || 'all';
        currentFilters.dateFilter = elements.dateFilter?.value || 'all';
        currentPage = 1;
        fetchSubmissions();
    }
    
    /**
     * Handle search input changes
     */
    function handleSearchChange() {
        currentFilters.search = elements.searchInput?.value.trim() || '';
        currentPage = 1;
        fetchSubmissions();
    }
    
    /**
     * Handle select all checkbox
     */
    function handleSelectAll() {
        if (!elements.selectAllCheckbox) return;
        
        const isChecked = elements.selectAllCheckbox.checked;
        selectedSubmissions.clear();
        
        document.querySelectorAll('.submission-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            if (isChecked) {
                selectedSubmissions.add(parseInt(checkbox.value));
            }
        });
        
        updateBulkActionButtons();
    }
    
    /**
     * Handle individual submission selection
     */
    function handleSubmissionSelect(e) {
        const submissionId = parseInt(e.target.value);
        
        if (e.target.checked) {
            selectedSubmissions.add(submissionId);
        } else {
            selectedSubmissions.delete(submissionId);
        }
        
        // Update select all checkbox
        const totalCheckboxes = document.querySelectorAll('.submission-checkbox').length;
        const checkedCheckboxes = document.querySelectorAll('.submission-checkbox:checked').length;
        
        if (elements.selectAllCheckbox) {
            elements.selectAllCheckbox.checked = totalCheckboxes === checkedCheckboxes;
            elements.selectAllCheckbox.indeterminate = checkedCheckboxes > 0 && checkedCheckboxes < totalCheckboxes;
        }
        
        updateBulkActionButtons();
    }
    
    /**
     * Update bulk action buttons state
     */
    function updateBulkActionButtons() {
        const hasSelected = selectedSubmissions.size > 0;
        if (elements.approveSelectedBtn) elements.approveSelectedBtn.disabled = !hasSelected;
        if (elements.rejectSelectedBtn) elements.rejectSelectedBtn.disabled = !hasSelected;
    }
    
    /**
     * Handle approve selected submissions
     */
    function handleApproveSelected() {
        if (selectedSubmissions.size === 0) return;
        
        const submissionIds = Array.from(selectedSubmissions);
        approveSubmission(submissionIds);
    }
    
    /**
     * Handle reject selected submissions
     */
    function handleRejectSelected() {
        if (selectedSubmissions.size === 0) return;
        
        currentSubmissionId = Array.from(selectedSubmissions);
        if (elements.rejectModal && elements.overlay) {
            elements.rejectModal.classList.add('active');
            elements.overlay.classList.add('active');
        }
    }
    
    /**
     * Approve submission(s)
     */
    async function approveSubmission(submissionIds) {
        try {
            showLoading();
            
            // Handle individual approvals
            for (const id of submissionIds) {
                const response = await fetch(`/api/admin/tools/${id}/approve`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.message || `Failed to approve tool ${id}`);
                }
            }
            
            showToast(`Successfully approved ${submissionIds.length} submission(s)`, 'success');
            selectedSubmissions.clear();
            if (elements.selectAllCheckbox) elements.selectAllCheckbox.checked = false;
            fetchSubmissions();
            fetchNotifications(); // Refresh notifications after approval
            
        } catch (error) {
            console.error('Error approving submissions:', error);
            showToast('Failed to approve submissions', 'error');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Reject submission(s)
     */
    async function rejectSubmission(submissionIds, reason) {
        try {
            showLoading();
            
            // Handle individual rejections
            for (const id of submissionIds) {
                const response = await fetch(`/api/admin/tools/${id}/reject`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        reason: reason || 'No reason provided'
                    })
                });
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.message || `Failed to reject tool ${id}`);
                }
            }
            
            showToast(`Successfully rejected ${submissionIds.length} submission(s)`, 'success');
            selectedSubmissions.clear();
            if (elements.selectAllCheckbox) elements.selectAllCheckbox.checked = false;
            fetchSubmissions();
            fetchNotifications(); // Refresh notifications after rejection
            
        } catch (error) {
            console.error('Error rejecting submissions:', error);
            showToast('Failed to reject submissions', 'error');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Show submission details modal
     */
    function showSubmissionDetails(submissionId) {
        const submission = allSubmissions.find(s => s.id === submissionId);
        if (!submission || !elements.submissionModal || !elements.overlay) return;
        
        if (elements.modalTitle) elements.modalTitle.textContent = submission.name;
        if (elements.submissionDetails) elements.submissionDetails.innerHTML = createSubmissionDetailsHTML(submission);
        
        // Set current submission for modal actions
        currentSubmissionId = submissionId;
        
        // Show/hide action buttons based on status
        if (submission.status === 'pending') {
            if (elements.approveBtn) elements.approveBtn.style.display = 'inline-flex';
            if (elements.rejectBtn) elements.rejectBtn.style.display = 'inline-flex';
        } else {
            if (elements.approveBtn) elements.approveBtn.style.display = 'none';
            if (elements.rejectBtn) elements.rejectBtn.style.display = 'none';
        }
        
        elements.submissionModal.classList.add('active');
        elements.overlay.classList.add('active');
    }
    
    /**
     * Create submission details HTML
     */
    function createSubmissionDetailsHTML(submission) {
        return `
            <div class="submission-details-grid">
                <div class="detail-group">
                    <label>Tool Name:</label>
                    <p>${submission.name}</p>
                </div>
                
                <div class="detail-group">
                    <label>Description:</label>
                    <p>${submission.description || submission.tool_description || 'No description provided'}</p>
                </div>
                
                <div class="detail-group">
                    <label>Category:</label>
                    <p>${submission.category || submission.tool_category}</p>
                </div>
                
                <div class="detail-group">
                    <label>Pricing:</label>
                    <p>${submission.pricing_type || submission.pricing || 'Not specified'}</p>
                </div>
                
                <div class="detail-group">
                    <label>Website URL:</label>
                    <p><a href="${submission.url || submission.tool_url}" target="_blank">${submission.url || submission.tool_url}</a></p>
                </div>
                
                <div class="detail-group">
                    <label>Contributor:</label>
                    <p>${submission.contributor_name || 'Anonymous'}</p>
                </div>
                
                <div class="detail-group">
                    <label>Email:</label>
                    <p>${submission.contributor_email || 'Not provided'}</p>
                </div>
                
                <div class="detail-group">
                    <label>Submitted:</label>
                    <p>${formatDate(submission.created_at)}</p>
                </div>
                
                <div class="detail-group">
                    <label>Status:</label>
                    <p><span class="status-badge ${getStatusClass(submission.status)}">${capitalizeFirstLetter(submission.status)}</span></p>
                </div>
                
                ${(submission.features || submission.tool_tags) ? `
                    <div class="detail-group full-width">
                        <label>Features:</label>
                        <div class="features-list">
                            ${(() => {
                                const features = submission.features || submission.tool_tags;
                                return Array.isArray(features) 
                                    ? features.map(feature => `<span class="feature-tag">${feature.trim()}</span>`).join('')
                                    : features.split(',').map(feature => `<span class="feature-tag">${feature.trim()}</span>`).join('');
                            })()}
                        </div>
                    </div>
                ` : ''}
                
                ${(submission.tags || submission.tool_tags) ? `
                    <div class="detail-group full-width">
                        <label>Tags:</label>
                        <div class="tags-list">
                            ${(() => {
                                const tags = submission.tags || submission.tool_tags;
                                return Array.isArray(tags) 
                                    ? tags.map(tag => `<span class="tag">${tag.trim()}</span>`).join('')
                                    : tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('');
                            })()}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Modal event handlers
     */
    function closeSubmissionModal() {
        if (elements.submissionModal) elements.submissionModal.classList.remove('active');
        if (elements.overlay) elements.overlay.classList.remove('active');
        currentSubmissionId = null;
    }
    
    function closeRejectModal() {
        if (elements.rejectModal) elements.rejectModal.classList.remove('active');
        if (elements.overlay) elements.overlay.classList.remove('active');
        if (elements.rejectReason) elements.rejectReason.value = '';
        currentSubmissionId = null;
    }
    
    function handleApproveFromModal() {
        if (currentSubmissionId) {
            approveSubmission([currentSubmissionId]);
            closeSubmissionModal();
        }
    }
    
    function handleRejectFromModal() {
        if (currentSubmissionId && elements.rejectModal) {
            elements.rejectModal.classList.add('active');
            closeSubmissionModal();
        }
    }
    
    function handleConfirmReject() {
        const reason = elements.rejectReason?.value.trim() || '';
        const submissionIds = Array.isArray(currentSubmissionId) ? currentSubmissionId : [currentSubmissionId];
        
        rejectSubmission(submissionIds, reason);
        closeRejectModal();
    }
    
    /**
     * Pagination
     */
    function renderPagination(totalPages, currentPageNum) {
        if (!elements.pagination || totalPages <= 1) {
            if (elements.pagination) elements.pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${currentPageNum === 1 ? 'disabled' : ''}" 
                    data-page="${currentPageNum - 1}" ${currentPageNum === 1 ? 'disabled' : ''}>
                <span class="material-icons-outlined">chevron_left</span>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPageNum ? 'active' : ''}" 
                        data-page="${i}">${i}</button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn ${currentPageNum === totalPages ? 'disabled' : ''}" 
                    data-page="${currentPageNum + 1}" ${currentPageNum === totalPages ? 'disabled' : ''}>
                <span class="material-icons-outlined">chevron_right</span>
            </button>
        `;
        
        elements.pagination.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        document.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && page !== currentPage) {
                    currentPage = page;
                    fetchSubmissions();
                }
            });
        });
    }
    
    /**
     * Utility functions
     */
    function getStatusClass(status) {
        switch (status) {
            case 'pending': return 'pending';
            case 'approved': return 'approved';
            case 'rejected': return 'rejected';
            default: return 'pending';
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function showLoading() {
        if (elements.submissionsTable) {
            elements.submissionsTable.innerHTML = `
                <tr class="loading-row">
                    <td colspan="7">
                        <div class="loading-indicator">
                            <div class="loader"></div>
                            <p>Loading...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    function hideLoading() {
        // Loading is hidden when fetchSubmissions() is called and updates the table
        // This function is here for consistency and future use
    }
    
    function showError(message) {
        if (elements.submissionsTable) {
            elements.submissionsTable.innerHTML = `
                <tr class="error-row">
                    <td colspan="7">
                        <div class="error-indicator">
                            <span class="material-icons-outlined">error_outline</span>
                            <p>${message}</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="material-icons-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    /**
     * Mock data fallback
     */
    function getMockSubmissions() {
        return [
            {
                id: 1,
                name: 'AI Content Generator Pro',
                description: 'Advanced AI tool for generating high-quality content',
                category: 'Writing',
                pricing_type: 'Freemium',
                website_url: 'https://aicontentgen.pro',
                contributor_name: 'John Doe',
                contributor_email: 'john@example.com',
                created_at: new Date().toISOString(),
                status: 'pending'
            }
        ];
    }
    
    /**
     * Notification Functions
     */
    
    /**
     * Mark all notifications as read
     */
    function markAllNotificationsAsRead() {
        fetch('/api/admin/notifications/mark-all-read', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update UI
                document.querySelectorAll('.notification-item').forEach(item => {
                    item.classList.remove('unread');
                });
                if (elements.notificationBadge) {
                    elements.notificationBadge.textContent = '0';
                    elements.notificationBadge.style.display = 'none';
                }
                if (elements.submissionsBadge) {
                    elements.submissionsBadge.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error marking notifications as read:', error);
        });
    }

    /**
     * Fetch notifications from API
     */
    function fetchNotifications() {
        fetch('/api/admin/notifications')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateNotificationsUI(data.notifications, data.unreadCount);
                }
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });
    }

    /**
     * Update notifications UI
     */
    function updateNotificationsUI(notifications, unreadCount) {
        // Update notification badge
        if (elements.notificationBadge) {
            if (unreadCount > 0) {
                elements.notificationBadge.textContent = unreadCount;
                elements.notificationBadge.style.display = 'block';
            } else {
                elements.notificationBadge.style.display = 'none';
            }
        }

        // Update submissions badge in sidebar
        if (elements.submissionsBadge) {
            const pendingSubmissions = notifications.filter(n => 
                n.type === 'tool_submission' && !n.is_read
            ).length;
            
            if (pendingSubmissions > 0) {
                elements.submissionsBadge.textContent = pendingSubmissions;
                elements.submissionsBadge.style.display = 'block';
            } else {
                elements.submissionsBadge.style.display = 'none';
            }
        }

        // Update notification list
        const notificationList = document.querySelector('.notification-list');
        if (notificationList && notifications.length > 0) {
            notificationList.innerHTML = notifications.slice(0, 5).map(notification => {
                const timeAgo = getTimeAgo(new Date(notification.created_at));
                const isUnread = !notification.is_read;
                
                return `
                    <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notification.id}">
                        <span class="material-icons-outlined notification-icon">
                            ${notification.type === 'tool_submission' ? 'add_circle' : 'info'}
                        </span>
                        <div class="notification-content">
                            <p>${notification.message}</p>
                            <span class="notification-time">${timeAgo}</span>
                        </div>
                    </div>
                `;
            }).join('');

            // Add click handlers to mark individual notifications as read
            notificationList.querySelectorAll('.notification-item.unread').forEach(item => {
                item.addEventListener('click', function() {
                    const notificationId = this.dataset.id;
                    markNotificationAsRead(notificationId, this);
                });
            });
        } else if (notificationList) {
            notificationList.innerHTML = `
                <div class="notification-item">
                    <span class="material-icons-outlined notification-icon">notifications_none</span>
                    <div class="notification-content">
                        <p>No notifications yet</p>
                        <span class="notification-time">All caught up!</span>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Mark individual notification as read
     */
    function markNotificationAsRead(notificationId, element) {
        fetch(`/api/admin/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                element.classList.remove('unread');
                // Refresh notifications to update counts
                fetchNotifications();
            }
        })
        .catch(error => {
            console.error('Error marking notification as read:', error);
        });
    }

    /**
     * Get time ago string
     */
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }
});
