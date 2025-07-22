/**
 * AITools - Admin Submissions JavaScript
 * Handles submissions listing and review functionality
 * @version 1.0.0
 * @date 2025-07-22
 * @author Pranay Kumar
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
        // Sidebar
        sidebar: document.querySelector('.admin-sidebar'),
        toggleSidebar: document.getElementById('toggle-sidebar'),
        closeSidebar: document.getElementById('close-sidebar'),
        
        // Notifications
        notificationBtn: document.getElementById('notification-btn'),
        notificationDropdown: document.getElementById('notification-dropdown'),
        
        // Profile
        profileBtn: document.getElementById('profile-btn'),
        profileDropdown: document.getElementById('profile-dropdown'),
        
        // Filters
        statusFilter: document.getElementById('status-filter'),
        categoryFilter: document.getElementById('category-filter'),
        dateFilter: document.getElementById('date-filter'),
        
        // Bulk actions
        selectAllCheckbox: document.getElementById('select-all-checkbox'),
        approveSelectedBtn: document.getElementById('approve-selected-btn'),
        rejectSelectedBtn: document.getElementById('reject-selected-btn'),
        
        // Table
        submissionsTable: document.getElementById('submissions-table'),
        
        // Pagination
        pagination: document.getElementById('pagination'),
        
        // Modals
        submissionModal: document.getElementById('submission-modal'),
        submissionDetails: document.getElementById('submission-details'),
        closeModalBtn: document.getElementById('close-modal'),
        closeDetailsBtn: document.getElementById('close-details-btn'),
        approveBtn: document.getElementById('approve-btn'),
        rejectBtn: document.getElementById('reject-btn'),
        
        rejectModal: document.getElementById('reject-modal'),
        rejectReason: document.getElementById('reject-reason'),
        closeRejectModalBtn: document.getElementById('close-reject-modal'),
        cancelRejectBtn: document.getElementById('cancel-reject-btn'),
        confirmRejectBtn: document.getElementById('confirm-reject-btn'),
        
        // Overlay
        overlay: document.getElementById('overlay')
    };
    
    // App state
    const state = {
        submissions: [],
        filteredSubmissions: [],
        currentPage: 1,
        itemsPerPage: 10,
        filters: {
            status: 'pending',
            category: 'all',
            date: 'all'
        },
        selectedIds: [],
        currentSubmissionId: null
    };
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Common UI interactions (sidebar, dropdowns, etc.)
        setupCommonInteractions();
        
        // Filters
        elements.statusFilter.addEventListener('change', handleFilterChange);
        elements.categoryFilter.addEventListener('change', handleFilterChange);
        elements.dateFilter.addEventListener('change', handleFilterChange);
        
        // Select all checkbox
        elements.selectAllCheckbox.addEventListener('change', toggleSelectAll);
        
        // Bulk action buttons
        elements.approveSelectedBtn.addEventListener('click', approveSelected);
        elements.rejectSelectedBtn.addEventListener('click', () => showRejectModal(state.selectedIds));
        
        // Modal close buttons
        elements.closeModalBtn.addEventListener('click', closeSubmissionModal);
        elements.closeDetailsBtn.addEventListener('click', closeSubmissionModal);
        elements.closeRejectModalBtn.addEventListener('click', closeRejectModal);
        elements.cancelRejectBtn.addEventListener('click', closeRejectModal);
        
        // Modal action buttons
        elements.approveBtn.addEventListener('click', () => approveSubmission(state.currentSubmissionId));
        elements.rejectBtn.addEventListener('click', () => showRejectModal([state.currentSubmissionId]));
        elements.confirmRejectBtn.addEventListener('click', confirmReject);
        
        // Overlay click
        elements.overlay.addEventListener('click', () => {
            closeSubmissionModal();
            closeRejectModal();
        });
        
        // Check for direct view parameter
        const urlParams = new URLSearchParams(window.location.search);
        const viewId = urlParams.get('id');
        if (viewId) {
            setTimeout(() => {
                viewSubmissionDetails(viewId);
            }, 500);
        }
    }
    
    /**
     * Set up common UI interactions (sidebar, dropdowns, etc.)
     */
    function setupCommonInteractions() {
        // Sidebar toggle
        elements.toggleSidebar.addEventListener('click', () => {
            elements.sidebar.classList.toggle('active');
            elements.overlay.classList.toggle('active');
            document.body.classList.toggle('scroll-lock');
        });
        
        elements.closeSidebar.addEventListener('click', closeSidebar);
        elements.overlay.addEventListener('click', closeSidebar);
        
        // Notifications dropdown
        elements.notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.notificationDropdown.classList.toggle('active');
            elements.profileDropdown.classList.remove('active');
        });
        
        // Profile dropdown
        elements.profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.profileDropdown.classList.toggle('active');
            elements.notificationDropdown.classList.remove('active');
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.notificationBtn.contains(e.target) && 
                !elements.notificationDropdown.contains(e.target)) {
                elements.notificationDropdown.classList.remove('active');
            }
            
            if (!elements.profileBtn.contains(e.target) && 
                !elements.profileDropdown.contains(e.target)) {
                elements.profileDropdown.classList.remove('active');
            }
        });
    }
    
    /**
     * Close sidebar
     */
    function closeSidebar() {
        elements.sidebar.classList.remove('active');
        elements.overlay.classList.remove('active');
        document.body.classList.remove('scroll-lock');
    }
    
    /**
     * Load initial data
     */
    function loadInitialData() {
        // Load categories for filter
        loadCategories();
        
        // Load submissions
        fetchSubmissions();
    }
    
    /**
     * Load categories for filter
     */
    function loadCategories() {
        // In a real app, this would be an API call
        fetch('/api/categories')
            .then(response => {
                if (!response.ok) {
                    return Promise.resolve([
                        'Productivity', 'Design', 'Writing', 'Education',
                        'Research', 'Development', 'Marketing'
                    ]);
                }
                return response.json();
            })
            .then(categories => {
                // Create category options
                const categoryOptions = categories.map(category => 
                    `<option value="${category}">${category}</option>`
                ).join('');
                
                // Update category filter
                elements.categoryFilter.innerHTML = `
                    <option value="all">All Categories</option>
                    ${categoryOptions}
                `;
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                // Fallback categories
                const fallbackCategories = [
                    'Productivity', 'Design', 'Writing', 'Education',
                    'Research', 'Development', 'Marketing'
                ];
                
                // Create category options
                const categoryOptions = fallbackCategories.map(category => 
                    `<option value="${category}">${category}</option>`
                ).join('');
                
                // Update category filter
                elements.categoryFilter.innerHTML = `
                    <option value="all">All Categories</option>
                    ${categoryOptions}
                `;
            });
    }
    
    /**
     * Fetch submissions
     */
    function fetchSubmissions() {
        // Show loading state
        elements.submissionsTable.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">
                    <div class="loading-indicator">
                        <div class="loader"></div>
                        <p>Loading submissions...</p>
                    </div>
                </td>
            </tr>
        `;
        
        // In a real app, this would be an API call with filters
        const queryParams = new URLSearchParams({
            status: state.filters.status,
            category: state.filters.category,
            date: state.filters.date
        }).toString();
        
        fetch(`/api/admin/submissions?${queryParams}`)
            .then(response => {
                if (!response.ok) {
                    return Promise.resolve(getMockSubmissions(state.filters));
                }
                return response.json();
            })
            .then(data => {
                // Store submissions in state
                state.submissions = data.submissions;
                state.filteredSubmissions = [...data.submissions];
                
                // Reset selection
                state.selectedIds = [];
                updateBulkActionButtons();
                
                // Render submissions
                renderSubmissions();
            })
            .catch(error => {
                console.error('Error fetching submissions:', error);
                // Use fallback data
                const mockData = getMockSubmissions(state.filters);
                state.submissions = mockData.submissions;
                state.filteredSubmissions = [...mockData.submissions];
                
                // Reset selection
                state.selectedIds = [];
                updateBulkActionButtons();
                
                // Render submissions
                renderSubmissions();
            });
    }
    
    /**
     * Render submissions table
     */
    function renderSubmissions() {
        // Calculate pagination
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        const paginatedSubmissions = state.filteredSubmissions.slice(startIndex, endIndex);
        
        // Create table rows
        if (paginatedSubmissions.length === 0) {
            elements.submissionsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        No submissions found matching the current filters.
                    </td>
                </tr>
            `;
            elements.pagination.innerHTML = '';
            elements.selectAllCheckbox.checked = false;
            elements.selectAllCheckbox.disabled = true;
            return;
        }
        
        // Enable select all checkbox
        elements.selectAllCheckbox.disabled = false;
        
        // Generate table rows
        const submissionsHTML = paginatedSubmissions.map(submission => {
            let statusClass = '';
            switch (submission.status) {
                case 'pending':
                    statusClass = 'pending';
                    break;
                case 'approved':
                    statusClass = 'approved';
                    break;
                case 'rejected':
                    statusClass = 'rejected';
                    break;
            }
            
            const isSelected = state.selectedIds.includes(submission.id);
            
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="row-checkbox" data-id="${submission.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>${submission.name}</td>
                    <td>${submission.category}</td>
                    <td>${submission.submitter}</td>
                    <td>${formatDate(submission.date_submitted)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${capitalizeFirstLetter(submission.status)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" data-id="${submission.id}" title="View Details">
                                <span class="material-icons-outlined">visibility</span>
                            </button>
                            ${submission.status === 'pending' ? `
                                <button class="action-btn approve-btn" data-id="${submission.id}" title="Approve">
                                    <span class="material-icons-outlined">check_circle</span>
                                </button>
                                <button class="action-btn reject-btn" data-id="${submission.id}" title="Reject">
                                    <span class="material-icons-outlined">cancel</span>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        elements.submissionsTable.innerHTML = submissionsHTML;
        
        // Add event listeners to row checkboxes
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleRowCheckboxChange);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                viewSubmissionDetails(id);
            });
        });
        
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                approveSubmission(id);
            });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showRejectModal([id]);
            });
        });
        
        // Render pagination
        renderPagination();
        
        // Update select all checkbox state
        updateSelectAllCheckbox();
    }
    
    /**
     * Render pagination controls
     */
    function renderPagination() {
        const totalPages = Math.ceil(state.filteredSubmissions.length / state.itemsPerPage);
        
        // Don't show pagination if only one page
        if (totalPages <= 1) {
            elements.pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        if (state.currentPage > 1) {
            paginationHTML += `
                <button class="page-btn prev-btn" data-page="${state.currentPage - 1}">
                    <span class="material-icons-outlined">keyboard_arrow_left</span>
                </button>
            `;
        }
        
        // Page buttons
        let startPage = Math.max(1, state.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start page if we're at the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (state.currentPage < totalPages) {
            paginationHTML += `
                <button class="page-btn next-btn" data-page="${state.currentPage + 1}">
                    <span class="material-icons-outlined">keyboard_arrow_right</span>
                </button>
            `;
        }
        
        elements.pagination.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', handlePageChange);
        });
    }
    
    /**
     * Handle page change
     * @param {Event} e - Click event
     */
    function handlePageChange(e) {
        const page = parseInt(e.currentTarget.dataset.page);
        state.currentPage = page;
        renderSubmissions();
        
        // Scroll to top of table
        elements.submissionsTable.parentNode.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /**
     * Handle filter change
     */
    function handleFilterChange() {
        // Update filters in state
        state.filters.status = elements.statusFilter.value;
        state.filters.category = elements.categoryFilter.value;
        state.filters.date = elements.dateFilter.value;
        
        // Reset current page
        state.currentPage = 1;
        
        // Fetch submissions with new filters
        fetchSubmissions();
    }
    
    /**
     * Toggle select all checkboxes
     */
    function toggleSelectAll() {
        const isChecked = elements.selectAllCheckbox.checked;
        
        // Update all row checkboxes
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
            
            // Update selected IDs
            const id = checkbox.getAttribute('data-id');
            if (isChecked) {
                if (!state.selectedIds.includes(id)) {
                    state.selectedIds.push(id);
                }
            } else {
                const index = state.selectedIds.indexOf(id);
                if (index !== -1) {
                    state.selectedIds.splice(index, 1);
                }
            }
        });
        
        // Update bulk action buttons
        updateBulkActionButtons();
    }
    
    /**
     * Handle row checkbox change
     * @param {Event} e - Change event
     */
    function handleRowCheckboxChange(e) {
        const checkbox = e.currentTarget;
        const id = checkbox.getAttribute('data-id');
        
        if (checkbox.checked) {
            // Add to selected IDs
            if (!state.selectedIds.includes(id)) {
                state.selectedIds.push(id);
            }
        } else {
            // Remove from selected IDs
            const index = state.selectedIds.indexOf(id);
            if (index !== -1) {
                state.selectedIds.splice(index, 1);
            }
        }
        
        // Update select all checkbox state
        updateSelectAllCheckbox();
        
        // Update bulk action buttons
        updateBulkActionButtons();
    }
    
    /**
     * Update select all checkbox state
     */
    function updateSelectAllCheckbox() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
        
        if (checkboxes.length === 0) {
            elements.selectAllCheckbox.checked = false;
            elements.selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === 0) {
            elements.selectAllCheckbox.checked = false;
            elements.selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === checkboxes.length) {
            elements.selectAllCheckbox.checked = true;
            elements.selectAllCheckbox.indeterminate = false;
        } else {
            elements.selectAllCheckbox.checked = false;
            elements.selectAllCheckbox.indeterminate = true;
        }
    }
    
    /**
     * Update bulk action buttons state
     */
    function updateBulkActionButtons() {
        // Only enable bulk actions when items are selected and they are pending
        let enableButtons = state.selectedIds.length > 0;
        
        // Check if all selected items are pending
        if (enableButtons) {
            const pendingOnly = state.selectedIds.every(id => {
                const submission = state.submissions.find(s => s.id === id);
                return submission && submission.status === 'pending';
            });
            
            enableButtons = pendingOnly;
        }
        
        elements.approveSelectedBtn.disabled = !enableButtons;
        elements.rejectSelectedBtn.disabled = !enableButtons;
    }
    
    /**
     * View submission details
     * @param {string} id - Submission ID
     */
    function viewSubmissionDetails(id) {
        // Set current submission ID
        state.currentSubmissionId = id;
        
        // Show loading state
        elements.submissionDetails.innerHTML = `
            <div class="loading-indicator">
                <div class="loader"></div>
                <p>Loading submission details...</p>
            </div>
        `;
        
        // Show modal
        openSubmissionModal();
        
        // Fetch submission details
        fetch(`/api/admin/submissions/${id}`)
            .then(response => {
                if (!response.ok) {
                    // Get submission from state
                    const submission = state.submissions.find(s => s.id === id);
                    
                    if (submission) {
                        return Promise.resolve(getMockSubmissionDetails(submission));
                    } else {
                        throw new Error('Submission not found');
                    }
                }
                return response.json();
            })
            .then(data => {
                // Update modal title
                document.getElementById('modal-title').textContent = `Submission: ${data.name}`;
                
                // Render submission details
                renderSubmissionDetails(data);
                
                // Update action buttons based on status
                if (data.status === 'pending') {
                    elements.approveBtn.style.display = 'block';
                    elements.rejectBtn.style.display = 'block';
                } else {
                    elements.approveBtn.style.display = 'none';
                    elements.rejectBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching submission details:', error);
                elements.submissionDetails.innerHTML = `
                    <div class="error-message">
                        <span class="material-icons-outlined">error_outline</span>
                        <p>Failed to load submission details</p>
                    </div>
                `;
            });
    }
    
    /**
     * Render submission details in the modal
     * @param {Object} submission - Submission details
     */
    function renderSubmissionDetails(submission) {
        // Format features as tags
        const featuresHTML = submission.features.map(feature => 
            `<span class="feature-tag">${feature}</span>`
        ).join('');
        
        // Format pricing as badge
        let pricingBadge = '';
        switch (submission.pricing) {
            case 'free':
                pricingBadge = '<span class="status-badge approved">Free</span>';
                break;
            case 'freemium':
                pricingBadge = '<span class="status-badge pending">Freemium</span>';
                break;
            case 'paid':
                pricingBadge = '<span class="status-badge rejected">Paid</span>';
                break;
        }
        
        // Format status badge
        let statusBadge = '';
        switch (submission.status) {
            case 'pending':
                statusBadge = '<span class="status-badge pending">Pending</span>';
                break;
            case 'approved':
                statusBadge = '<span class="status-badge approved">Approved</span>';
                break;
            case 'rejected':
                statusBadge = '<span class="status-badge rejected">Rejected</span>';
                break;
        }
        
        // Create HTML for submission details
        const detailsHTML = `
            <div class="submission-detail-grid">
                <div class="submission-left">
                    <img src="${submission.image}" alt="${submission.name}" class="submission-image">
                    <div class="detail-group">
                        <label>Name</label>
                        <p>${submission.name}</p>
                    </div>
                    <div class="detail-group">
                        <label>Category</label>
                        <p>${submission.category}</p>
                    </div>
                    <div class="detail-group">
                        <label>Pricing</label>
                        <p>${pricingBadge}</p>
                    </div>
                    <div class="detail-group">
                        <label>Status</label>
                        <p>${statusBadge}</p>
                    </div>
                    <div class="detail-group">
                        <label>Website URL</label>
                        <p><a href="${submission.url}" target="_blank">${submission.url}</a></p>
                    </div>
                </div>
                <div class="submission-right">
                    <div class="detail-group">
                        <label>Description</label>
                        <p>${submission.description}</p>
                    </div>
                    <div class="detail-group">
                        <label>Features</label>
                        <div class="feature-tags">
                            ${featuresHTML}
                        </div>
                    </div>
                    <div class="detail-group submitter-info">
                        <label>Submitted By</label>
                        <p><strong>${submission.submitter.name}</strong> (${submission.submitter.email})</p>
                        <p>Date: ${formatDate(submission.date_submitted)}</p>
                    </div>
                </div>
            </div>
            ${submission.reelUrl ? `
                <div class="submission-reel">
                    <div class="detail-group">
                        <label>Instagram Reel</label>
                        <p><a href="${submission.reelUrl}" target="_blank">${submission.reelUrl}</a></p>
                    </div>
                </div>
            ` : ''}
            ${submission.status === 'rejected' && submission.rejectionReason ? `
                <div class="detail-group">
                    <label>Rejection Reason</label>
                    <p>${submission.rejectionReason}</p>
                </div>
            ` : ''}
        `;
        
        elements.submissionDetails.innerHTML = detailsHTML;
    }
    
    /**
     * Open submission modal
     */
    function openSubmissionModal() {
        elements.submissionModal.classList.add('active');
        elements.overlay.classList.add('active');
        document.body.classList.add('scroll-lock');
    }
    
    /**
     * Close submission modal
     */
    function closeSubmissionModal() {
        elements.submissionModal.classList.remove('active');
        elements.overlay.classList.remove('active');
        document.body.classList.remove('scroll-lock');
        state.currentSubmissionId = null;
    }
    
    /**
     * Show reject modal
     * @param {Array} ids - Array of submission IDs to reject
     */
    function showRejectModal(ids) {
        // Store IDs for rejection
        state.rejectIds = ids;
        
        // Clear previous reason
        elements.rejectReason.value = '';
        
        // Show modal
        elements.rejectModal.classList.add('active');
        elements.overlay.classList.add('active');
        document.body.classList.add('scroll-lock');
        
        // Focus on reason textarea
        elements.rejectReason.focus();
    }
    
    /**
     * Close reject modal
     */
    function closeRejectModal() {
        elements.rejectModal.classList.remove('active');
        
        // Only remove overlay and scroll lock if submission modal is not active
        if (!elements.submissionModal.classList.contains('active')) {
            elements.overlay.classList.remove('active');
            document.body.classList.remove('scroll-lock');
        }
        
        // Clear reject IDs
        state.rejectIds = [];
    }
    
    /**
     * Confirm rejection with reason
     */
    function confirmReject() {
        const reason = elements.rejectReason.value.trim();
        
        // Validate reason
        if (!reason) {
            alert('Please provide a reason for rejection.');
            return;
        }
        
        // Close reject modal
        closeRejectModal();
        
        // Show loading UI
        elements.confirmRejectBtn.disabled = true;
        elements.confirmRejectBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Rejecting...';
        
        // Process rejection for each ID
        const rejections = state.rejectIds.map(id => {
            return fetch(`/api/admin/submissions/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            })
            .then(response => {
                if (!response.ok) {
                    // Simulate success for demo
                    return Promise.resolve({ success: true, id });
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error rejecting submission ${id}:`, error);
                return { success: false, id, error };
            });
        });
        
        // Wait for all rejections to complete
        Promise.all(rejections)
            .then(results => {
                // Check if all were successful
                const allSuccessful = results.every(result => result.success);
                
                if (allSuccessful) {
                    // Show success message
                    alert(`Successfully rejected ${results.length} submission(s).`);
                    
                    // Update submissions in state
                    state.rejectIds.forEach(id => {
                        const submission = state.submissions.find(s => s.id === id);
                        if (submission) {
                            submission.status = 'rejected';
                            submission.rejectionReason = reason;
                        }
                    });
                    
                    // Close submission modal if open
                    closeSubmissionModal();
                    
                    // Remove IDs from selected
                    state.rejectIds.forEach(id => {
                        const index = state.selectedIds.indexOf(id);
                        if (index !== -1) {
                            state.selectedIds.splice(index, 1);
                        }
                    });
                    
                    // Refresh table
                    renderSubmissions();
                } else {
                    // Show error message
                    const failedCount = results.filter(result => !result.success).length;
                    alert(`Failed to reject ${failedCount} submission(s). Please try again.`);
                }
                
                // Reset button
                elements.confirmRejectBtn.disabled = false;
                elements.confirmRejectBtn.innerHTML = '<span class="material-icons-outlined">cancel</span> Confirm Rejection';
            });
    }
    
    /**
     * Approve a submission
     * @param {string} id - Submission ID
     */
    function approveSubmission(id) {
        // If ID is an array, handle as bulk action
        if (Array.isArray(id)) {
            return approveSelected();
        }
        
        // Show loading UI for specific button if in table
        const approveBtn = document.querySelector(`.approve-btn[data-id="${id}"]`);
        if (approveBtn) {
            approveBtn.disabled = true;
            approveBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span>';
        }
        
        // Disable modal approve button if open
        if (elements.approveBtn) {
            elements.approveBtn.disabled = true;
            elements.approveBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Approving...';
        }
        
        // Call API to approve
        fetch(`/api/admin/submissions/${id}/approve`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                // Simulate success for demo
                return Promise.resolve({ success: true });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Update submission in state
                const submission = state.submissions.find(s => s.id === id);
                if (submission) {
                    submission.status = 'approved';
                }
                
                // Close modal if open
                closeSubmissionModal();
                
                // Remove ID from selected
                const index = state.selectedIds.indexOf(id);
                if (index !== -1) {
                    state.selectedIds.splice(index, 1);
                }
                
                // Refresh table
                renderSubmissions();
                
                // Show success message
                alert('Submission approved successfully.');
            } else {
                throw new Error('Failed to approve submission');
            }
        })
        .catch(error => {
            console.error('Error approving submission:', error);
            alert('Failed to approve submission. Please try again.');
            
            // Reset buttons
            if (approveBtn) {
                approveBtn.disabled = false;
                approveBtn.innerHTML = '<span class="material-icons-outlined">check_circle</span>';
            }
            
            if (elements.approveBtn) {
                elements.approveBtn.disabled = false;
                elements.approveBtn.innerHTML = '<span class="material-icons-outlined">check_circle</span> Approve';
            }
        });
    }
    
    /**
     * Approve selected submissions
     */
    function approveSelected() {
        if (state.selectedIds.length === 0) {
            alert('No submissions selected.');
            return;
        }
        
        // Confirm approval
        if (!confirm(`Are you sure you want to approve ${state.selectedIds.length} submission(s)?`)) {
            return;
        }
        
        // Show loading UI
        elements.approveSelectedBtn.disabled = true;
        elements.approveSelectedBtn.innerHTML = '<span class="material-icons-outlined">hourglass_top</span> Approving...';
        
        // Process approval for each ID
        const approvals = state.selectedIds.map(id => {
            return fetch(`/api/admin/submissions/${id}/approve`, {
                method: 'POST'
            })
            .then(response => {
                if (!response.ok) {
                    // Simulate success for demo
                    return Promise.resolve({ success: true, id });
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error approving submission ${id}:`, error);
                return { success: false, id, error };
            });
        });
        
        // Wait for all approvals to complete
        Promise.all(approvals)
            .then(results => {
                // Check if all were successful
                const allSuccessful = results.every(result => result.success);
                
                if (allSuccessful) {
                    // Show success message
                    alert(`Successfully approved ${results.length} submission(s).`);
                    
                    // Update submissions in state
                    state.selectedIds.forEach(id => {
                        const submission = state.submissions.find(s => s.id === id);
                        if (submission) {
                            submission.status = 'approved';
                        }
                    });
                    
                    // Clear selected IDs
                    state.selectedIds = [];
                    
                    // Refresh table
                    renderSubmissions();
                } else {
                    // Show error message
                    const failedCount = results.filter(result => !result.success).length;
                    alert(`Failed to approve ${failedCount} submission(s). Please try again.`);
                }
                
                // Reset button
                elements.approveSelectedBtn.disabled = false;
                elements.approveSelectedBtn.innerHTML = '<span class="material-icons-outlined">check_circle</span> Approve Selected';
            });
    }
    
    /**
     * Get mock submissions data filtered by status
     * @param {Object} filters - Filter options
     * @returns {Object} Mock submissions data
     */
    function getMockSubmissions(filters) {
        // Generate 20 mock submissions
        const allSubmissions = Array.from({ length: 20 }, (_, i) => {
            const id = (i + 1).toString();
            const submissionDate = new Date();
            submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 30));
            
            // For demo, distribute statuses
            let status = 'pending';
            if (i < 5) {
                status = 'approved';
            } else if (i >= 15) {
                status = 'rejected';
            }
            
            // Randomly assign categories
            const categories = ['Productivity', 'Design', 'Writing', 'Education', 'Research', 'Development', 'Marketing'];
            const category = categories[Math.floor(Math.random() * categories.length)];
            
            // Create name based on category
            const names = {
                'Productivity': ['TaskMaster AI', 'Productivity Boost', 'WorkflowGPT'],
                'Design': ['DesignAI Pro', 'CreativeGPT', 'Visual Assistant'],
                'Writing': ['WriterBot', 'ContentGPT', 'WordSmith AI'],
                'Education': ['StudyBuddy AI', 'EduTech AI', 'Learning Assistant'],
                'Research': ['ResearchGPT', 'Data Analyzer', 'Research Buddy'],
                'Development': ['CodeGPT', 'DevAssist', 'Code Wizard'],
                'Marketing': ['MarketingGPT', 'SEO Wizard', 'Campaign Creator']
            };
            
            const nameOptions = names[category] || ['AI Tool'];
            const name = nameOptions[Math.floor(Math.random() * nameOptions.length)] + ` ${id}`;
            
            // Create submitter info
            const submitters = [
                'john.doe@example.com',
                'sarah.smith@example.com',
                'michael.brown@example.com',
                'emily.wilson@example.com',
                'david.johnson@example.com'
            ];
            
            return {
                id,
                name,
                category,
                status,
                submitter: submitters[Math.floor(Math.random() * submitters.length)],
                date_submitted: submissionDate.toISOString().split('T')[0]
            };
        });
        
        // Apply filters
        let filteredSubmissions = [...allSubmissions];
        
        if (filters.status !== 'all') {
            filteredSubmissions = filteredSubmissions.filter(s => s.status === filters.status);
        }
        
        if (filters.category !== 'all') {
            filteredSubmissions = filteredSubmissions.filter(s => s.category === filters.category);
        }
        
        if (filters.date !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            filteredSubmissions = filteredSubmissions.filter(s => {
                const submissionDate = new Date(s.date_submitted);
                submissionDate.setHours(0, 0, 0, 0);
                
                switch (filters.date) {
                    case 'today':
                        return submissionDate.getTime() === today.getTime();
                    case 'week':
                        return submissionDate >= weekAgo;
                    case 'month':
                        return submissionDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        return {
            submissions: filteredSubmissions
        };
    }
    
    /**
     * Get detailed mock data for a submission
     * @param {Object} submission - Basic submission data
     * @returns {Object} Detailed submission data
     */
    function getMockSubmissionDetails(submission) {
        // Generate random features based on category
        const featuresByCategory = {
            'Productivity': ['Task Management', 'Calendar Integration', 'Time Tracking', 'Automation'],
            'Design': ['Image Generation', 'UI/UX Templates', 'Color Palette', 'Style Transfer'],
            'Writing': ['Grammar Checking', 'Content Generation', 'SEO Optimization', 'Plagiarism Check'],
            'Education': ['Quiz Generation', 'Learning Path', 'Progress Tracking', 'Flashcards'],
            'Research': ['Data Analysis', 'Citation Manager', 'Paper Summarization', 'Trend Identification'],
            'Development': ['Code Generation', 'Debugging', 'Code Review', 'API Integration'],
            'Marketing': ['Campaign Management', 'Social Media Tools', 'A/B Testing', 'Analytics']
        };
        
        const categoryFeatures = featuresByCategory[submission.category] || ['Feature 1', 'Feature 2'];
        const features = [];
        const featureCount = Math.floor(Math.random() * 3) + 1; // 1-3 features
        
        for (let i = 0; i < featureCount; i++) {
            const feature = categoryFeatures[Math.floor(Math.random() * categoryFeatures.length)];
            if (!features.includes(feature)) {
                features.push(feature);
            }
        }
        
        // Generate random description based on category
        const descriptions = {
            'Productivity': 'A powerful AI-powered productivity tool that helps you manage tasks, automate workflows, and save time on repetitive processes.',
            'Design': 'An innovative design assistant that uses AI to generate professional visuals, recommend color palettes, and enhance your creative process.',
            'Writing': 'An advanced writing tool powered by AI to help you create engaging content, check grammar, and optimize for SEO.',
            'Education': 'A comprehensive learning platform that uses AI to create personalized study plans, generate quizzes, and track progress.',
            'Research': 'A research assistant that uses AI to analyze data, summarize papers, and identify trends in your field of study.',
            'Development': 'A coding companion that helps developers write better code faster with AI-powered suggestions, debugging, and code review.',
            'Marketing': 'A marketing automation tool that uses AI to optimize campaigns, analyze performance, and identify growth opportunities.'
        };
        
        // Random pricing model
        const pricingOptions = ['free', 'freemium', 'paid'];
        const pricing = pricingOptions[Math.floor(Math.random() * pricingOptions.length)];
        
        // Random image based on category
        const imageId = 700 + parseInt(submission.id);
        
        // Create detailed submission object
        return {
            ...submission,
            description: descriptions[submission.category] || 'An AI-powered tool designed to improve your workflow.',
            url: `https://example.com/tool${submission.id}`,
            image: `https://picsum.photos/id/${imageId}/600/400`,
            features,
            pricing,
            submitter: {
                name: submission.submitter.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                email: submission.submitter
            },
            reelUrl: Math.random() > 0.5 ? `https://www.instagram.com/reel/example${submission.id}/` : null,
            rejectionReason: submission.status === 'rejected' ? 'This submission does not meet our quality standards.' : null
        };
    }
    
    /**
     * Format a date string to a readable format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }
    
    /**
     * Capitalize the first letter of a string
     * @param {string} string - String to capitalize
     * @returns {string} Capitalized string
     */
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});