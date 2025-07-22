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
        if (elements.toggleSidebar) {
            elements.toggleSidebar.addEventListener('click', () => {
                elements.sidebar.classList.toggle('active');
                if (elements.overlay) elements.overlay.classList.toggle('active');
                document.body.classList.toggle('scroll-lock');
            });
        }
        
        if (elements.closeSidebar) {
            elements.closeSidebar.addEventListener('click', closeSidebar);
        }
        
        if (elements.overlay) {
            elements.overlay.addEventListener('click', closeSidebar);
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
     * Close sidebar
     */
    function closeSidebar() {
        if (elements.sidebar) elements.sidebar.classList.remove('active');
        if (elements.overlay) elements.overlay.classList.remove('active');
        document.body.classList.remove('scroll-lock');
    }
    
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
    
    /**
     * Fetch dashboard data from API
     */
    function fetchDashboardData() {
        fetchStatistics();
        fetchRecentSubmissions();
        fetchCategoriesDistribution();
        fetchPopularTools();
        fetchNotifications();
    }
    
    /**
     * Fetch statistics for dashboard
     */
    function fetchStatistics() {
        fetch('/api/admin/stats')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.stats) {
                    const stats = data.stats;
                    if (elements.totalToolsCount) elements.totalToolsCount.textContent = stats.totalTools;
                    if (elements.pendingSubmissionsCount) elements.pendingSubmissionsCount.textContent = stats.pendingSubmissions;
                    if (elements.avgRating) elements.avgRating.textContent = stats.avgRating;
                    if (elements.contributorsCount) elements.contributorsCount.textContent = stats.contributors;
                    
                    if (elements.submissionsBadge) {
                        elements.submissionsBadge.textContent = stats.pendingSubmissions;
                        elements.submissionsBadge.style.display = stats.pendingSubmissions > 0 ? 'flex' : 'none';
                    }
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(error => {
                console.error('Error fetching statistics:', error);
                // Use fallback data
                if (elements.totalToolsCount) elements.totalToolsCount.textContent = '42';
                if (elements.pendingSubmissionsCount) elements.pendingSubmissionsCount.textContent = '7';
                if (elements.avgRating) elements.avgRating.textContent = '4.3';
                if (elements.contributorsCount) elements.contributorsCount.textContent = '28';
                
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
        
        fetch('/api/admin/submissions?status=pending&limit=5')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.submissions) {
                    const submissionsHTML = data.submissions.map(submission => createSubmissionRow(submission)).join('');
                    elements.recentSubmissionsTable.innerHTML = submissionsHTML;
                    
                    document.querySelectorAll('.view-submission-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const submissionId = btn.getAttribute('data-id');
                            window.location.href = `submissions.html?id=${submissionId}`;
                        });
                    });
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(error => {
                console.error('Error fetching submissions:', error);
                const mockSubmissions = getMockSubmissions();
                const submissionsHTML = mockSubmissions.submissions.map(submission => createSubmissionRow(submission)).join('');
                elements.recentSubmissionsTable.innerHTML = submissionsHTML;
                
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
     */
    function createSubmissionRow(submission) {
        let statusClass = '';
        switch (submission.status) {
            case 'pending': statusClass = 'pending'; break;
            case 'approved': statusClass = 'approved'; break;
            case 'rejected': statusClass = 'rejected'; break;
        }
        
        return `
            <tr>
                <td>${submission.name}</td>
                <td>${submission.category}</td>
                <td>${submission.contributor_name || 'Anonymous'}</td>
                <td>${formatDate(submission.created_at)}</td>
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
        
        fetch('/api/admin/categories')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.distribution) {
                    const chartData = {
                        labels: data.distribution.map(item => item.category),
                        data: data.distribution.map(item => item.count)
                    };
                    createCategoriesChart(chartData);
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(error => {
                console.error('Error fetching categories distribution:', error);
                const fallbackData = {
                    labels: ['Productivity', 'Design', 'Writing', 'Education', 'Research', 'Development', 'Marketing'],
                    data: [28, 23, 18, 15, 12, 10, 8]
                };
                createCategoriesChart(fallbackData);
            });
    }
    
    /**
     * Create categories chart
     */
    function createCategoriesChart(data) {
        if (!elements.categoriesChart) return;
        
        elements.categoriesChart.innerHTML = '';
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            elements.categoriesChart.innerHTML = `
                <div class="chart-placeholder">
                    <span class="material-icons-outlined">bar_chart</span>
                    <p>Chart.js not loaded</p>
                </div>
            `;
            return;
        }
        
        const canvas = document.createElement('canvas');
        elements.categoriesChart.appendChild(canvas);
        
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: [
                        '#4361ee', '#f72585', '#10b981', '#ff9800', 
                        '#6c757d', '#6610f2', '#0dcaf0'
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
                            font: { family: 'Plus Jakarta Sans' }
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
    }
    
    /**
     * Fetch popular tools
     */
    function fetchPopularTools() {
        if (!elements.popularToolsList) return;
        
        fetch('/api/admin/tools?status=approved&limit=5')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tools) {
                    const toolsHTML = data.tools.map(tool => createPopularToolItem(tool)).join('');
                    elements.popularToolsList.innerHTML = toolsHTML;
                } else {
                    throw new Error('Invalid response format');
                }
            })
            .catch(error => {
                console.error('Error fetching popular tools:', error);
                const mockTools = getMockPopularTools();
                const toolsHTML = mockTools.tools.map(tool => createPopularToolItem(tool)).join('');
                elements.popularToolsList.innerHTML = toolsHTML;
            });
    }
    
    /**
     * Create popular tool item HTML
     */
    function createPopularToolItem(tool) {
        return `
            <div class="popular-tool-item">
                <img src="${tool.image_url || '../assets/default-tool.png'}" alt="${tool.name}" class="popular-tool-image" onerror="this.src='../assets/default-tool.png'">
                <div class="popular-tool-info">
                    <h3 class="popular-tool-name">${tool.name}</h3>
                    <p class="popular-tool-category">${tool.category}</p>
                </div>
                <div class="popular-tool-rating">
                    <span class="rating-stars">${'★'.repeat(Math.floor(tool.rating || 0))}</span>
                    <span class="rating-value">${tool.rating || 0}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Utility functions
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Mock data fallbacks
     */
    function getMockSubmissions() {
        return {
            submissions: [
                {
                    id: 1,
                    name: 'AI Text Generator Pro',
                    category: 'Writing',
                    contributor_name: 'John Doe',
                    created_at: new Date().toISOString(),
                    status: 'pending'
                },
                {
                    id: 2,
                    name: 'Smart Image Editor',
                    category: 'Design',
                    contributor_name: 'Jane Smith',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    status: 'pending'
                }
            ]
        };
    }
    
    function getMockPopularTools() {
        return {
            tools: [
                {
                    id: 1,
                    name: 'ChatGPT',
                    category: 'Writing',
                    rating: 4.8,
                    image_url: '../assets/default-tool.png'
                },
                {
                    id: 2,
                    name: 'DALL-E',
                    category: 'Design',
                    rating: 4.6,
                    image_url: '../assets/default-tool.png'
                }
            ]
        };
    }
});
