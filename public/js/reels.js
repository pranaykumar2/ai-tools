/**
 * AITools - Reels JavaScript
 * Handles fetching and displaying Instagram reels
 * @version 1.0.0
 * @date 2025-07-22
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
        reelsGrid: document.getElementById('reels-grid'),
        loadingState: document.getElementById('loading-state'),
        emptyState: document.getElementById('empty-state'),
        reelModal: document.getElementById('reel-modal'),
        modalTitle: document.getElementById('modal-title'),
        embedContainer: document.getElementById('embed-container'),
        visitTool: document.getElementById('visit-tool'),
        viewOnInstagram: document.getElementById('view-on-instagram'),
        closeModal: document.getElementById('close-modal'),
        overlay: document.getElementById('overlay')
    };
    
    // Fetch reels when page loads
    fetchReels();
    
    // Set up event listeners
    elements.closeModal.addEventListener('click', closeModal);
    elements.overlay.addEventListener('click', closeModal);
    
    /**
     * Fetch reels from the API
     */
    function fetchReels() {
        // Show loading state
        elements.loadingState.style.display = 'block';
        elements.emptyState.style.display = 'none';
        
        // Fetch from the API
        fetch('/api/reels')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    if (data.reels.length > 0) {
                        renderReels(data.reels);
                    } else {
                        showEmptyState();
                    }
                } else {
                    throw new Error('Failed to fetch reels');
                }
            })
            .catch(error => {
                console.error('Error fetching reels:', error);
                showEmptyState();
            });
    }
    
    /**
     * Render reels in the grid
     * @param {Array} reels - Array of reel objects
     */
    function renderReels(reels) {
        // Hide loading state
        elements.loadingState.style.display = 'none';
        
        // Generate HTML for reels
        const reelsHTML = reels.map(reel => {
            // Generate thumbnail URL from Instagram URL
            // This is a placeholder - in a real app, you'd extract this from the Instagram API
            const thumbnailUrl = `https://source.unsplash.com/random/600x1067?ai,${reel.toolName.replace(/\s+/g, '+')}`;
            
            return `
                <div class="reel-card" data-id="${reel.id}" data-url="${reel.url}" data-tool-id="${reel.toolId}" data-tool-name="${reel.toolName}">
                    <div class="reel-thumbnail">
                        <img src="${thumbnailUrl}" alt="${reel.toolName} demo" loading="lazy">
                        <div class="reel-overlay">
                            <div class="reel-play-icon">
                                <span class="material-icons-outlined">play_arrow</span>
                            </div>
                            <h3 class="reel-tool-name">${reel.toolName}</h3>
                            <div class="reel-date">Added on ${formatDate(reel.date_added)}</div>
                            <div class="reel-instagram-logo">
                                <svg viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add to DOM
        elements.reelsGrid.innerHTML = reelsHTML;
        
        // Add click listeners to reel cards
        document.querySelectorAll('.reel-card').forEach(card => {
            card.addEventListener('click', () => {
                openReelModal(card.dataset);
            });
        });
    }
    
    /**
     * Show empty state
     */
    function showEmptyState() {
        elements.loadingState.style.display = 'none';
        elements.emptyState.style.display = 'block';
    }
    
    /**
     * Open reel modal
     * @param {Object} data - Reel data
     */
    function openReelModal(data) {
        // Set modal title
        elements.modalTitle.textContent = data.toolName;
        
        // Set tool link
        elements.visitTool.href = `/tools/${data.toolId}`;
        
        // Set Instagram link
        elements.viewOnInstagram.href = data.url;
        
        // Set embed
        const instagramUrl = data.url;
        const embedHtml = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${instagramUrl}?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14"></blockquote>`;
        elements.embedContainer.innerHTML = embedHtml;
        
        // Process Instagram embeds
        if (window.instgrm) {
            window.instgrm.Embeds.process();
        } else {
            // If Instagram embed script hasn't loaded yet, try again in a second
            setTimeout(() => {
                if (window.instgrm) {
                    window.instgrm.Embeds.process();
                }
            }, 1000);
        }
        
        // Show modal
        elements.reelModal.classList.add('active');
        elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close reel modal
     */
    function closeModal() {
        elements.reelModal.classList.remove('active');
        elements.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    /**
     * Format date to readable format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }
});