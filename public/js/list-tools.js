/**
 * AITools - List Tools JavaScript
 * Handles fetching, displaying, and interacting with AI tools collection
 * @version 1.0.0
 * @date 2025-07-21
 */

// Store app state
const appState = {
    tools: [],              // All tools from database
    filteredTools: [],      // Tools after applying filters
    currentPage: 1,         // Current page of pagination
    itemsPerPage: 8,        // Number of tools per page
    viewMode: 'grid',       // 'grid' or 'list'
    wishlist: [],           // Array of tool IDs in wishlist
    sidebarVisible: false,  // Is sidebar visible
    activeFilters: {
        categories: [],
        pricing: [],
        features: []
    },
    searchQuery: ''         // Current search query
};

// API endpoint for tools data
const API_ENDPOINT = 'https://api.aitools.com/tools';  // Replace with your actual API endpoint

// DOM Elements - cached for performance
let elements = {};

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    cacheElements();
    
    // Load user preferences from localStorage
    loadUserPreferences();
    
    // Set up event listeners
    setupEventListeners();
    
    // Fetch tools from database
    fetchTools();
});

/**
 * Cache DOM elements for better performance
 */
function cacheElements() {
    elements = {
        // Main containers
        sidebar: document.getElementById('sidebar'),
        toolsGrid: document.getElementById('tools-grid'),
        toolsContainer: document.querySelector('.tools-container'),
        
        // Search
        searchInput: document.getElementById('search-input'),
        searchClear: document.getElementById('search-clear'),
        
        // Filter elements
        categoryFilters: document.getElementById('category-filters'),
        pricingFilters: document.getElementById('pricing-filters'),
        featureFilters: document.getElementById('feature-filters'),
        resetFilters: document.getElementById('reset-filters'),
        emptyResetBtn: document.getElementById('empty-reset-btn'),
        
        // View and sort
        gridViewBtn: document.getElementById('grid-view'),
        listViewBtn: document.getElementById('list-view'),
        sortSelect: document.getElementById('sort-select'),
        
        // Stats and info
        toolsCount: document.getElementById('tools-count'),
        
        // States
        loadingState: document.getElementById('loading-state'),
        emptyState: document.getElementById('empty-state'),
        
        // Wishlist
        wishlistCount: document.getElementById('wishlist-count'),
        wishlistModal: document.getElementById('wishlist-modal'),
        wishlistItems: document.getElementById('wishlist-items'),
        emptyWishlist: document.getElementById('empty-wishlist'),
        
        // Sidebar toggles
        toggleSidebar: document.getElementById('toggle-sidebar'),
        closeSidebar: document.getElementById('close-sidebar'),
        
        // Overlay
        overlay: document.getElementById('overlay'),
        
        // Pagination
        pagination: document.getElementById('pagination')
    };
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Sidebar toggle
    elements.toggleSidebar.addEventListener('click', toggleSidebar);
    elements.closeSidebar.addEventListener('click', closeSidebar);
    elements.overlay.addEventListener('click', closeSidebar);
    
    // Search
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.searchClear.addEventListener('click', clearSearch);
    
    // View toggle
    elements.gridViewBtn.addEventListener('click', () => setViewMode('grid'));
    elements.listViewBtn.addEventListener('click', () => setViewMode('list'));
    
    // Sort
    elements.sortSelect.addEventListener('change', sortTools);
    
    // Reset filters
    elements.resetFilters.addEventListener('click', resetFilters);
    elements.emptyResetBtn.addEventListener('click', resetFilters);
    
    // Wishlist modal
    document.getElementById('open-wishlist').addEventListener('click', openWishlistModal);
    document.getElementById('close-wishlist').addEventListener('click', closeWishlistModal);
}

/**
 * Fetch tools from the database
 */
function fetchTools() {
    // Show loading state
    elements.loadingState.style.display = 'block';
    elements.emptyState.style.display = 'none';
    
    // In a real app, this would be an API call
    // For this demo, we'll simulate an API call with setTimeout
    setTimeout(() => {
        // Fetch mock data
        fetch('mock-tools-data.json')
            .then(response => {
                // If no mock data file exists, use hardcoded data
                if (!response.ok) {
                    return Promise.resolve(getMockToolsData());
                }
                return response.json();
            })
            .then(data => {
                // Store tools in app state
                appState.tools = data;
                appState.filteredTools = [...data];
                
                // Generate filter options based on available tools
                generateFilterOptions();
                
                // Apply any active filters
                applyFilters();
                
                // Render tools
                renderTools();
                
                // Hide loading state
                elements.loadingState.style.display = 'none';
                
                // If sidebar should be visible by default on larger screens
                if (window.innerWidth >= 992 && !appState.sidebarVisible) {
                    toggleSidebar();
                }
            })
            .catch(error => {
                console.error('Error fetching tools:', error);
                elements.loadingState.style.display = 'none';
                elements.emptyState.style.display = 'block';
            });
    }, 1000); // Simulate network delay
}

/**
 * Generate mock tools data (for demo purposes)
 * In a real application, this data would come from an API
 * @returns {Array} Array of tool objects
 */
function getMockToolsData() {
    // Categories and features for random generation
    const categories = ['Productivity', 'Design', 'Writing', 'Education', 'Research', 'Development', 'Marketing'];
    const features = ['API Access', 'Mobile App', 'Integrations', 'Offline Mode', 'Team Collaboration', 'Analytics'];
    const pricingOptions = ['free', 'freemium', 'paid'];
    
    // Generate 20 mock tools
    return Array.from({ length: 20 }, (_, i) => {
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Random pricing
        const pricing = pricingOptions[Math.floor(Math.random() * pricingOptions.length)];
        
        // Random features (1-3)
        const toolFeatures = [];
        const featureCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < featureCount; j++) {
            const feature = features[Math.floor(Math.random() * features.length)];
            if (!toolFeatures.includes(feature)) {
                toolFeatures.push(feature);
            }
        }
        
        // Random rating (3.5-5.0)
        const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
        
        // Random tags
        const tags = [];
        switch (category) {
            case 'Productivity':
                tags.push('Automation', 'Time Management');
                break;
            case 'Design':
                tags.push('Image Generation', 'UI/UX');
                break;
            case 'Writing':
                tags.push('Content Creation', 'Grammar');
                break;
            case 'Education':
                tags.push('Learning', 'Tutoring');
                break;
            case 'Research':
                tags.push('Data Analysis', 'Literature Review');
                break;
            case 'Development':
                tags.push('Code Generation', 'Debugging');
                break;
            case 'Marketing':
                tags.push('SEO', 'Content Strategy');
                break;
        }
        
        // Add pro tag for paid tools
        if (pricing === 'paid') {
            tags.push('Pro');
        }
        
        // Get a dynamic image for the tool
        const imageId = 700 + i;
        
        return {
            id: (i + 1).toString(),
            name: `AI Tool ${i + 1}`,
            description: `This is an AI-powered ${category.toLowerCase()} tool that helps you ${getRandomDescription(category)}`,
            category: category,
            url: `https://example.com/tool${i + 1}`,
            image: `https://picsum.photos/id/${imageId}/800/450`,
            pricing: pricing,
            features: toolFeatures,
            tags: tags,
            rating: parseFloat(rating),
            date_added: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
    });
}

/**
 * Get a random description based on category
 * @param {string} category - Tool category
 * @returns {string} Random description
 */
function getRandomDescription(category) {
    const descriptions = {
        'Productivity': [
            'automate repetitive tasks and save time.',
            'manage your workflow with intelligent assistance.',
            'organize your tasks and projects more efficiently.'
        ],
        'Design': [
            'create stunning visuals with minimal effort.',
            'generate professional designs from simple prompts.',
            'enhance your creative process with AI suggestions.'
        ],
        'Writing': [
            'write better content with AI-powered suggestions.',
            'improve your writing style and grammar.',
            'generate high-quality content in seconds.'
        ],
        'Education': [
            'learn new concepts with personalized AI tutoring.',
            'enhance your study sessions with smart summaries.',
            'master complex subjects with interactive lessons.'
        ],
        'Research': [
            'analyze data and extract valuable insights.',
            'find relevant information from vast databases.',
            'summarize research papers and articles quickly.'
        ],
        'Development': [
            'write code faster with AI assistance.',
            'debug your applications more efficiently.',
            'generate working code from natural language descriptions.'
        ],
        'Marketing': [
            'optimize your content for better engagement.',
            'analyze market trends and consumer behavior.',
            'create targeted marketing campaigns with AI insights.'
        ]
    };
    
    const options = descriptions[category] || ['improve your workflow with artificial intelligence.'];
    return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate filter options based on available tools
 */
function generateFilterOptions() {
    // Get unique categories, features, and count tools by pricing
    const categories = {};
    const features = {};
    const pricing = {
        'free': 0,
        'freemium': 0,
        'paid': 0
    };
    
    appState.tools.forEach(tool => {
        // Count categories
        if (!categories[tool.category]) {
            categories[tool.category] = 0;
        }
        categories[tool.category]++;
        
        // Count pricing
        if (pricing.hasOwnProperty(tool.pricing)) {
            pricing[tool.pricing]++;
        }
        
        // Count features
        if (tool.features && Array.isArray(tool.features)) {
            tool.features.forEach(feature => {
                if (!features[feature]) {
                    features[feature] = 0;
                }
                features[feature]++;
            });
        }
    });
    
    // Generate category filters HTML
    const categoryHTML = Object.entries(categories)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([category, count]) => createFilterItem('category', category, count))
        .join('');
    
    elements.categoryFilters.innerHTML = categoryHTML;
    
    // Generate pricing filters HTML
    const pricingHTML = Object.entries(pricing)
        .map(([option, count]) => {
            // Capitalize first letter
            const label = option.charAt(0).toUpperCase() + option.slice(1);
            return createFilterItem('pricing', option, count, label);
        })
        .join('');
    
    elements.pricingFilters.innerHTML = pricingHTML;
    
    // Generate feature filters HTML
    const featureHTML = Object.entries(features)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .map(([feature, count]) => createFilterItem('feature', feature, count))
        .join('');
    
    elements.featureFilters.innerHTML = featureHTML;
    
    // Add event listeners to filter checkboxes
    document.querySelectorAll('.filter-item').forEach(item => {
        item.addEventListener('click', toggleFilter);
    });
}

/**
 * Create filter item HTML
 * @param {string} type - Filter type (category, pricing, feature)
 * @param {string} value - Filter value
 * @param {number} count - Number of tools with this filter
 * @param {string} label - Optional custom label
 * @returns {string} HTML for filter item
 */
function createFilterItem(type, value, count, label = null) {
    const isChecked = appState.activeFilters[type + 's'] && 
                     appState.activeFilters[type + 's'].includes(value);
    
    return `
        <div class="filter-item" data-type="${type}" data-value="${value}">
            <div class="filter-checkbox ${isChecked ? 'checked' : ''}"></div>
            <div class="filter-label">${label || value}</div>
            <div class="filter-count">${count}</div>
        </div>
    `;
}

/**
 * Toggle a filter when clicked
 * @param {Event} e - Click event
 */
function toggleFilter(e) {
    const filterItem = e.currentTarget;
    const checkbox = filterItem.querySelector('.filter-checkbox');
    const type = filterItem.dataset.type;
    const value = filterItem.dataset.value;
    
    // Toggle checked state
    checkbox.classList.toggle('checked');
    
    // Update active filters
    const filterType = type + 's'; // category -> categories, feature -> features, pricing -> pricings
    
    if (!appState.activeFilters[filterType]) {
        appState.activeFilters[filterType] = [];
    }
    
    if (checkbox.classList.contains('checked')) {
        // Add filter
        if (!appState.activeFilters[filterType].includes(value)) {
            appState.activeFilters[filterType].push(value);
        }
    } else {
        // Remove filter
        const index = appState.activeFilters[filterType].indexOf(value);
        if (index !== -1) {
            appState.activeFilters[filterType].splice(index, 1);
        }
    }
    
    // Apply filters
    applyFilters();
    
    // Save user preferences
    saveUserPreferences();
}

/**
 * Apply all active filters to tools
 */
function applyFilters() {
    // Start with all tools
    let filtered = [...appState.tools];
    
    // Apply search filter if there's a query
    if (appState.searchQuery.trim() !== '') {
        const query = appState.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(tool => {
            return (
                tool.name.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.category.toLowerCase().includes(query) ||
                (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        });
    }
    
    // Apply category filters
    if (appState.activeFilters.categories && appState.activeFilters.categories.length > 0) {
        filtered = filtered.filter(tool => 
            appState.activeFilters.categories.includes(tool.category)
        );
    }
    
    // Apply pricing filters
    if (appState.activeFilters.pricings && appState.activeFilters.pricings.length > 0) {
        filtered = filtered.filter(tool => 
            appState.activeFilters.pricings.includes(tool.pricing)
        );
    }
    
    // Apply feature filters
    if (appState.activeFilters.features && appState.activeFilters.features.length > 0) {
        filtered = filtered.filter(tool => {
            if (!tool.features) return false;
            return appState.activeFilters.features.some(feature => 
                tool.features.includes(feature)
            );
        });
    }
    
    // Apply current sort
    const sortBy = elements.sortSelect.value;
    filtered = sortToolsArray(filtered, sortBy);
    
    // Update filtered tools
    appState.filteredTools = filtered;
    
    // Reset to first page
    appState.currentPage = 1;
    
    // Render tools with updated filters
    renderTools();
}

/**
 * Sort tools based on selected option
 */
function sortTools() {
    const sortBy = elements.sortSelect.value;
    appState.filteredTools = sortToolsArray(appState.filteredTools, sortBy);
    renderTools();
    saveUserPreferences();
}

/**
 * Sort an array of tools based on sort option
 * @param {Array} tools - Array of tool objects
 * @param {string} sortBy - Sort option
 * @returns {Array} Sorted array of tools
 */
function sortToolsArray(tools, sortBy) {
    const sortedTools = [...tools];
    
    switch (sortBy) {
        case 'popular':
            // Sort by rating (highest first)
            sortedTools.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            // Sort by date added (newest first)
            sortedTools.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));
            break;
        case 'rating':
            // Sort by rating (highest first)
            sortedTools.sort((a, b) => b.rating - a.rating);
            break;
        case 'az':
            // Sort alphabetically
            sortedTools.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    return sortedTools;
}

/**
 * Render tools based on current state
 */
function renderTools() {
    // Calculate pagination
    const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
    const endIndex = startIndex + appState.itemsPerPage;
    const paginatedTools = appState.filteredTools.slice(startIndex, endIndex);
    
    // Update tools count
    elements.toolsCount.textContent = `Showing ${paginatedTools.length} of ${appState.filteredTools.length} tools`;
    
    // Show empty state if no tools
    if (appState.filteredTools.length === 0) {
        elements.emptyState.style.display = 'block';
        elements.toolsGrid.innerHTML = '';
        elements.pagination.innerHTML = '';
        return;
    }
    
    // Hide empty state
    elements.emptyState.style.display = 'none';
    
    // Generate tools HTML
    const toolsHTML = paginatedTools.map(tool => createToolCard(tool)).join('');
    elements.toolsGrid.innerHTML = toolsHTML;
    
    // Set view mode class
    elements.toolsGrid.className = `tools-grid ${appState.viewMode}-view`;
    
    // Generate pagination
    renderPagination();
    
    // Add event listeners to wishlist buttons
    document.querySelectorAll('.wishlist-add-btn').forEach(btn => {
        btn.addEventListener('click', toggleWishlistItem);
    });
}

/**
 * Create HTML for a tool card
 * @param {Object} tool - Tool object
 * @returns {string} HTML for tool card
 */
function createToolCard(tool) {
    // Generate rating stars
    const rating = tool.rating || 0;
    
    // Generate tags HTML
    const tagsHTML = tool.tags.map(tag => {
        const isPro = tag.toLowerCase() === 'pro';
        return `<span class="tool-tag${isPro ? ' pro' : ''}">${tag}</span>`;
    }).join('');
    
    // Check if tool is in wishlist
    const isWishlisted = appState.wishlist.includes(tool.id);
    
    return `
        <div class="tool-card" data-id="${tool.id}">
            <div class="tool-image-container">
                <img src="${tool.image}" alt="${tool.name}" class="tool-image" loading="lazy">
                <div class="tool-rating">
                    <span class="material-icons-outlined">star</span>
                    ${rating}
                </div>
            </div>
            <div class="tool-content">
                <div class="tool-header">
                    <h3 class="tool-name">${tool.name}</h3>
                    <div class="tool-category">
                        <span class="material-icons-outlined">category</span>
                        ${tool.category}
                    </div>
                </div>
                <p class="tool-description">${tool.description}</p>
                <div class="tool-tags">
                    ${tagsHTML}
                </div>
                <div class="tool-actions">
                    <a href="${tool.url}" target="_blank" class="visit-btn" rel="noopener">
                        <span class="material-icons-outlined">open_in_new</span>
                        Visit Site
                    </a>
                    <button class="wishlist-add-btn ${isWishlisted ? 'active' : ''}" data-id="${tool.id}" aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}">
                        <span class="material-icons-outlined">${isWishlisted ? 'favorite' : 'favorite_border'}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render pagination controls
 */
function renderPagination() {
    const totalPages = Math.ceil(appState.filteredTools.length / appState.itemsPerPage);
    
    // Don't show pagination if only one page
    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (appState.currentPage > 1) {
        paginationHTML += `
            <button class="page-btn prev-btn" data-page="${appState.currentPage - 1}">
                <span class="material-icons-outlined">keyboard_arrow_left</span>
            </button>
        `;
    }
    
    // Page buttons
    let startPage = Math.max(1, appState.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust start page if we're at the end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn ${i === appState.currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    // Next button
    if (appState.currentPage < totalPages) {
        paginationHTML += `
            <button class="page-btn next-btn" data-page="${appState.currentPage + 1}">
                <span class="material-icons-outlined">keyboard_arrow_right</span>
            </button>
        `;
    }
    
    elements.pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', changePage);
    });
}

/**
 * Change to a specific page
 * @param {Event} e - Click event
 */
function changePage(e) {
    const page = parseInt(e.currentTarget.dataset.page);
    if (page !== appState.currentPage) {
        appState.currentPage = page;
        renderTools();
        
        // Scroll to top of tools container
        elements.toolsContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
    appState.sidebarVisible = !appState.sidebarVisible;
    elements.sidebar.classList.toggle('active', appState.sidebarVisible);
    elements.overlay.classList.toggle('active', appState.sidebarVisible);
    elements.toolsContainer.classList.toggle('sidebar-visible', appState.sidebarVisible);
    
    // Add/remove scroll lock on body
    document.body.classList.toggle('scroll-lock', appState.sidebarVisible && window.innerWidth < 992);
    
    saveUserPreferences();
}

/**
 * Close sidebar
 */
function closeSidebar() {
    if (appState.sidebarVisible) {
        appState.sidebarVisible = false;
        elements.sidebar.classList.remove('active');
        elements.overlay.classList.remove('active');
        elements.toolsContainer.classList.remove('sidebar-visible');
        document.body.classList.remove('scroll-lock');
        
        saveUserPreferences();
    }
}

/**
 * Handle search input
 */
function handleSearchInput() {
    const query = elements.searchInput.value;
    
    // Show/hide clear button
    elements.searchClear.classList.toggle('visible', query.length > 0);
    
    // Update search query
    appState.searchQuery = query;
    
    // Debounce search to avoid too many renders
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

/**
 * Clear search input
 */
function clearSearch() {
    elements.searchInput.value = '';
    elements.searchClear.classList.remove('visible');
    appState.searchQuery = '';
    applyFilters();
}

/**
 * Reset all filters
 */
function resetFilters() {
    // Clear all checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.classList.remove('checked');
    });
    
    // Clear active filters
    appState.activeFilters = {
        categories: [],
        pricing: [],
        features: []
    };
    
    // Clear search
    clearSearch();
    
    // Apply filters (which will now show all tools)
    applyFilters();
    
    // Save user preferences
    saveUserPreferences();
}

/**
 * Set view mode (grid or list)
 * @param {string} mode - 'grid' or 'list'
 */
function setViewMode(mode) {
    // Update view mode
    appState.viewMode = mode;
    
    // Update UI
    if (mode === 'grid') {
        elements.gridViewBtn.classList.add('active');
        elements.listViewBtn.classList.remove('active');
    } else {
        elements.gridViewBtn.classList.remove('active');
        elements.listViewBtn.classList.add('active');
    }
    
    // Update tools grid class
    elements.toolsGrid.className = `tools-grid ${mode}-view`;
    
    // Save user preferences
    saveUserPreferences();
}

/**
 * Toggle a tool in the wishlist
 * @param {Event} e - Click event
 */
function toggleWishlistItem(e) {
    const btn = e.currentTarget;
    const toolId = btn.dataset.id;
    
    // Toggle active state
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        // Add to wishlist
        if (!appState.wishlist.includes(toolId)) {
            appState.wishlist.push(toolId);
            btn.innerHTML = '<span class="material-icons-outlined">favorite</span>';
            btn.setAttribute('aria-label', 'Remove from wishlist');
        }
    } else {
        // Remove from wishlist
        const index = appState.wishlist.indexOf(toolId);
        if (index !== -1) {
            appState.wishlist.splice(index, 1);
            btn.innerHTML = '<span class="material-icons-outlined">favorite_border</span>';
            btn.setAttribute('aria-label', 'Add to wishlist');
        }
    }
    
    // Update wishlist count
    updateWishlistCount();
    
    // Save user preferences
    saveUserPreferences();
    
    // If wishlist modal is open, update it
    if (elements.wishlistModal.classList.contains('active')) {
        renderWishlistItems();
    }
}

/**
 * Update wishlist count badge
 */
function updateWishlistCount() {
    elements.wishlistCount.textContent = appState.wishlist.length;
    elements.wishlistCount.style.display = appState.wishlist.length > 0 ? 'flex' : 'none';
}

/**
 * Open wishlist modal
 */
function openWishlistModal() {
    elements.wishlistModal.classList.add('active');
    document.body.classList.add('scroll-lock');
    renderWishlistItems();
}

/**
 * Close wishlist modal
 */
function closeWishlistModal() {
    elements.wishlistModal.classList.remove('active');
    document.body.classList.remove('scroll-lock');
}

/**
 * Render items in the wishlist
 */
function renderWishlistItems() {
    // Show empty wishlist message if no items
    if (appState.wishlist.length === 0) {
        elements.emptyWishlist.style.display = 'block';
        elements.wishlistItems.innerHTML = '';
        return;
    }
    
    // Hide empty wishlist message
    elements.emptyWishlist.style.display = 'none';
    
    // Get wishlist tools
    const wishlistTools = appState.tools.filter(tool => appState.wishlist.includes(tool.id));
    
    // Generate wishlist items HTML
    const wishlistHTML = wishlistTools.map(tool => {
        return `
            <div class="wishlist-item" data-id="${tool.id}">
                <img src="${tool.image}" alt="${tool.name}" class="wishlist-item-img" loading="lazy">
                <div class="wishlist-item-content">
                    <h3 class="wishlist-item-name">${tool.name}</h3>
                    <p class="wishlist-item-category">${tool.category}</p>
                    <div class="wishlist-item-actions">
                        <a href="${tool.url}" target="_blank" class="wishlist-visit-btn" rel="noopener">
                            <span class="material-icons-outlined">open_in_new</span>
                            Visit
                        </a>
                        <button class="wishlist-remove-btn" data-id="${tool.id}">
                            <span class="material-icons-outlined">delete_outline</span>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.wishlistItems.innerHTML = wishlistHTML;
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
        btn.addEventListener('click', removeFromWishlist);
    });
}

/**
 * Remove a tool from the wishlist
 * @param {Event} e - Click event
 */
function removeFromWishlist(e) {
    const btn = e.currentTarget;
    const toolId = btn.dataset.id;
    
    // Remove from wishlist
    const index = appState.wishlist.indexOf(toolId);
    if (index !== -1) {
        appState.wishlist.splice(index, 1);
    }
    
    // Update wishlist count
    updateWishlistCount();
    
    // Update wishlist UI
    renderWishlistItems();
    
    // Update tool card button if it's visible
    const toolBtn = document.querySelector(`.wishlist-add-btn[data-id="${toolId}"]`);
    if (toolBtn) {
        toolBtn.classList.remove('active');
        toolBtn.innerHTML = '<span class="material-icons-outlined">favorite_border</span>';
        toolBtn.setAttribute('aria-label', 'Add to wishlist');
    }
    
    // Save user preferences
    saveUserPreferences();
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences() {
    const preferences = {
        wishlist: appState.wishlist,
        viewMode: appState.viewMode,
        sortBy: elements.sortSelect.value,
        sidebarVisible: appState.sidebarVisible,
        activeFilters: appState.activeFilters
    };
    
    localStorage.setItem('aitools-preferences', JSON.stringify(preferences));
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('aitools-preferences'));
    
    if (preferences) {
        // Restore wishlist
        if (preferences.wishlist) {
            appState.wishlist = preferences.wishlist;
            updateWishlistCount();
        }
        
        // Restore view mode
        if (preferences.viewMode) {
            appState.viewMode = preferences.viewMode;
            setViewMode(preferences.viewMode);
        }
        
        // Restore sort option
        if (preferences.sortBy) {
            elements.sortSelect.value = preferences.sortBy;
        }
        
        // Restore sidebar visibility (only on larger screens)
        if (preferences.sidebarVisible && window.innerWidth >= 992) {
            appState.sidebarVisible = true;
            // Will be applied when tools are loaded
        }
        
        // Restore active filters
        if (preferences.activeFilters) {
            appState.activeFilters = preferences.activeFilters;
            // Checkboxes will be updated when filters are generated
        }
    }
}