/**
 * AITools - Admin Dashboard JavaScript
 * Handles dashboard functionality and data visualization
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
        notificationBadge: document.getElementById('notification-badge'),
        markAllRead: document.getElementById('mark-all-read'),
        
        // Profile
        profileBtn: document.getElementById('profile-btn'),
        profileDropdown: document.getElementById('profile-dropdown'),
        
        // Logout
        logoutBtn: document.getElementById('logout-btn'),
        logoutDropdownBtn: document.getElementById('logout-dropdown-btn'),
        
        // Stats
        totalToolsCount: document.getElementById('total-tools-count'),
        pendingSubmissionsCount: document.getElementById('pending-submissions-count'),
        avgRating: document.getElementById('avg-rating'),
        contributorsCount: document.getElementById('contributors-count'),
        
        // Tables
        recentSubmissionsTable: document.getElementById('recent-submissions-table'),
        
        // Charts
        categoriesChart: document.getElementById('categories-chart'),
        
        // Lists
        popularToolsList: document.getElementById('popular-tools-list'),
        
        // Badges
        submissionsBadge: document.getElementById('submissions-badge'),
        
        // Overlay
        overlay: document.getElementById('overlay')
    };
    
    // Set up event listeners
    setupEventListeners();
    
    // Fetch dashboard data
    fetchDashboardData();
    
    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
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
        
        // Mark all notifications as read
        if (elements.markAllRead) {
            elements.markAllRead.addEventListener('click', markAllNotificationsAsRead);
        }
        
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
        
        // Logout buttons
        elements.logoutBtn.addEventListener('click', handleLogout);
        if (elements.logoutDropdownBtn) {
            elements.logoutDropdownBtn.addEventListener('click', handleLogout);
        }
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
     * Mark all notifications as read
     */
    function markAllNotificationsAsRead() {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.remove('unread');
        });
        elements.notificationBadge.textContent = '0';
        elements.notificationBadge.style.display = 'none';
    }
    
    /**
     * Handle logout
     */
    function handleLogout() {
        // In a real app, you would perform a logout API request here
        alert('Logging out...');
        window.location.href = '../index.html';
    }
    
    /**
     * Fetch dashboard data from API
     */
    function fetchDashboardData() {
        // Fetch statistics
        fetchStatistics();
        
        // Fetch recent submissions
        fetchRecentSubmissions();
        
        // Fetch categories distribution for chart
        fetchCategoriesDistribution();
        
        // Fetch popular tools
        fetchPopularTools();
    }
    
    /**
     * Fetch statistics for dashboard
     */
    function fetchStatistics() {
        // In a real app, this would be an API call
        // Fetch dashboard statistics
        fetch('/api/admin/stats')
            .then(response => {
                if (!response.ok) {
                    return Promise.resolve({
                        totalTools: 42,
                        pendingSubmissions: 7,
                        avgRating: 4.3,
                        contributors: 28
                    });
                }
                return response.json();
            })
            .then(data => {
                // Update statistics in the UI
                if (elements.totalToolsCount) elements.totalToolsCount.textContent = data.totalTools;
                if (elements.pendingSubmissionsCount) elements.pendingSubmissionsCount.textContent = data.pendingSubmissions;
                if (elements.avgRating) elements.avgRating.textContent = data.avgRating;
                if (elements.contributorsCount) elements.contributorsCount.textContent = data.contributors;
                
                // Update badges
                if (elements.submissionsBadge) {
                    elements.submissionsBadge.textContent = data.pendingSubmissions;
                    elements.submissionsBadge.style.display = data.pendingSubmissions > 0 ? 'flex' : 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching statistics:', error);
                // Use fallback data
                if (elements.totalToolsCount) elements.totalToolsCount.textContent = '42';
                if (elements.pendingSubmissionsCount) elements.pendingSubmissionsCount.textContent = '7';
                if (elements.avgRating) elements.avgRating.textContent = '4.3';
                if (elements.contributorsCount) elements.contributorsCount.textContent = '28';
                
                // Update badges
                if (elements.submissionsBadge) {
                    elements.submissionsBadge.textContent = '7';
                    elements.submissionsBadge.style.display = 'flex';
                }
            });
    }
    
    /**
     * Fetch recent submissions
     */
    function fetchRecentSubmissions() {
        if (!elements.recentSubmissionsTable) return;
        
        // In a real app, this would be an API call
        fetch('/api/admin/submissions?limit=5')
            .then(response => {
                if (!response.ok) {
                    return Promise.resolve(getMockSubmissions());
                }
                return response.json();
            })
            .then(data => {
                // Create table rows
                const submissionsHTML = data.submissions.map(submission => createSubmissionRow(submission)).join('');
                elements.recentSubmissionsTable.innerHTML = submissionsHTML;
                
                // Add event listeners to action buttons
                document.querySelectorAll('.view-submission-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const submissionId = btn.getAttribute('data-id');
                        window.location.href = `submissions.html?id=${submissionId}`;
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching submissions:', error);
                // Use fallback data
                const submissionsHTML = getMockSubmissions().submissions.map(submission => createSubmissionRow(submission)).join('');
                elements.recentSubmissionsTable.innerHTML = submissionsHTML;
                
                // Add event listeners to action buttons
                document.querySelectorAll('.view-submission-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const submissionId = btn.getAttribute('data-id');
                        window.location.href = `submissions.html?id=${submissionId}`;
                    });
                });
            });
    }
    
    /**
     * Create HTML for a submission row
     * @param {Object} submission - Submission object
     * @returns {string} HTML for submission row
     */
    function createSubmissionRow(submission) {
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
        
        return `
            <tr>
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
                        <button class="action-btn view-btn view-submission-btn" data-id="${submission.id}" title="View Details">
                            <span class="material-icons-outlined">visibility</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    
    /**
     * Fetch categories distribution for chart
     */
    function fetchCategoriesDistribution() {
        if (!elements.categoriesChart) return;
        
        // In a real app, this would be an API call
        fetch('/api/admin/categories-distribution')
            .then(response => {
                if (!response.ok) {
                    return Promise.resolve({
                        labels: ['Productivity', 'Design', 'Writing', 'Education', 'Research', 'Development', 'Marketing'],
                        data: [28, 23, 18, 15, 12, 10, 8]
                    });
                }
                return response.json();
            })
            .then(data => {
                // Remove placeholder
                elements.categoriesChart.innerHTML = '';
                
                // Create canvas for chart
                const canvas = document.createElement('canvas');
                elements.categoriesChart.appendChild(canvas);
                
                // Create chart
                new Chart(canvas, {
                    type: 'doughnut',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            data: data.data,
                            backgroundColor: [
                                '#4361ee', // Primary
                                '#f72585', // Secondary
                                '#10b981', // Success
                                '#ff9800', // Warning
                                '#6c757d', // Gray
                                '#6610f2', // Purple
                                '#0dcaf0'  // Cyan
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    font: {
                                        family: 'Plus Jakarta Sans'
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${label}: ${value} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching categories distribution:', error);
                elements.categoriesChart.innerHTML = `
                    <div class="chart-placeholder">
                        <span class="material-icons-outlined">error_outline</span>
                        <p>Failed to load chart</p>
                    </div>
                `;
            });
    }
    
    /**
     * Fetch popular tools
     */
    function fetchPopularTools() {
        if (!elements.popularToolsList) return;
        
        // In a real app, this would be an API call
        fetch('/api/admin/popular-tools')
            .then(response => {
                if (!response.ok) {
                    return Promise.resolve(getMockPopularTools());
                }
                return response.json();
            })
            .then(data => {
                // Create popular tools list
                const toolsHTML = data.tools.map(tool => {
                    return `
                        <div class="popular-tool-item">
                            <img src="${tool.image}" alt="${tool.name}" class="popular-tool-image">
                            <div class="popular-tool-info">
                                <h3 class="popular-tool-name">${tool.name}</h3>
                                <p class="popular-tool-category">${tool.category}</p>
                            </div>
                            <div class="popular-tool-rating">
                                <span class="material-icons-outlined">star</span>
                                ${tool.rating}
                            </div>
                        </div>
                    `;
                }).join('');
                
                elements.popularToolsList.innerHTML = toolsHTML;
            })
            .catch(error => {
                console.error('Error fetching popular tools:', error);
                // Use fallback data
                const toolsHTML = getMockPopularTools().tools.map(tool => {
                    return `
                        <div class="popular-tool-item">
                            <img src="${tool.image}" alt="${tool.name}" class="popular-tool-image">
                            <div class="popular-tool-info">
                                <h3 class="popular-tool-name">${tool.name}</h3>
                                <p class="popular-tool-category">${tool.category}</p>
                            </div>
                            <div class="popular-tool-rating">
                                <span class="material-icons-outlined">star</span>
                                ${tool.rating}
                            </div>
                        </div>
                    `;
                }).join('');
                
                elements.popularToolsList.innerHTML = toolsHTML;
            });
    }
    
    /**
     * Get mock submissions data
     * @returns {Object} Mock submissions data
     */
    function getMockSubmissions() {
        return {
            submissions: [
                {
                    id: '1',
                    name: 'AI Text Generator',
                    category: 'Writing',
                    submitter: 'john.doe@example.com',
                    date_submitted: '2025-07-21',
                    status: 'pending'
                },
                {
                    id: '2',
                    name: 'DesignAI Pro',
                    category: 'Design',
                    submitter: 'sarah.smith@example.com',
                    date_submitted: '2025-07-20',
                    status: 'approved'
                },
                {
                    id: '3',
                    name: 'Code Assistant Pro',
                    category: 'Development',
                    submitter: 'michael.brown@example.com',
                    date_submitted: '2025-07-19',
                    status: 'pending'
                },
                {
                    id: '4',
                    name: 'Research Buddy',
                    category: 'Research',
                    submitter: 'emily.wilson@example.com',
                    date_submitted: '2025-07-18',
                    status: 'rejected'
                },
                {
                    id: '5',
                    name: 'MarketingGPT',
                    category: 'Marketing',
                    submitter: 'david.johnson@example.com',
                    date_submitted: '2025-07-17',
                    status: 'pending'
                }
            ]
        };
    }
    
    /**
     * Get mock popular tools data
     * @returns {Object} Mock popular tools data
     */
    function getMockPopularTools() {
        return {
            tools: [
                {
                    id: '1',
                    name: 'DesignAI Pro',
                    category: 'Design',
                    image: 'https://picsum.photos/id/237/200/200',
                    rating: 4.9
                },
                {
                    id: '2',
                    name: 'WriterBot',
                    category: 'Writing',
                    image: 'https://picsum.photos/id/238/200/200',
                    rating: 4.8
                },
                {
                    id: '3',
                    name: 'Code Assistant',
                    category: 'Development',
                    image: 'https://picsum.photos/id/239/200/200',
                    rating: 4.7
                },
                {
                    id: '4',
                    name: 'ProductivityAI',
                    category: 'Productivity',
                    image: 'https://picsum.photos/id/240/200/200',
                    rating: 4.6
                },
                {
                    id: '5',
                    name: 'EduTech AI',
                    category: 'Education',
                    image: 'https://picsum.photos/id/241/200/200',
                    rating: 4.5
                }
            ]
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