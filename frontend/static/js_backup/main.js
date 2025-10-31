// Anthony's Musings - Main Application Logic

class MusingsApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.explicitContentEnabled = false;
        this.currentContent = null;
        this.searchTimeout = null;
        this.isLoading = false;
        
        // Initialize the application
        this.init();
    }

    async init() {
        console.log('Initializing Anthony\'s Musings Terminal Interface...');
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize components
        this.initEventListeners();
        this.initSearchBar();
        this.initContentFilters();
        this.initExplicitToggle();
        
        // Load initial data
        await this.loadDashboardData();
        await this.loadTagCloud();
        
        // Hide loading screen after delay
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = document.querySelector('.loading-text');
        
        const loadingMessages = [
            'Initializing neural networks...',
            'Loading creative algorithms...',
            'Parsing poetic structures...',
            'Calibrating artistic matrices...',
            'Accessing memory banks...',
            'System ready.'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (messageIndex < loadingMessages.length) {
                loadingText.textContent = loadingMessages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 500);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    initEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });

        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changeViewMode(btn.dataset.view);
            });
        });

        // Back button in content viewer
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigateToPage('browse');
            });
        }

        // Content warning modal buttons
        const confirmAgeBtn = document.getElementById('confirmAge');
        const cancelWarningBtn = document.getElementById('cancelWarning');
        
        if (confirmAgeBtn) {
            confirmAgeBtn.addEventListener('click', () => {
                this.hideContentWarning();
                if (this.currentContent) {
                    this.displayContent(this.currentContent, true);
                }
            });
        }
        
        if (cancelWarningBtn) {
            cancelWarningBtn.addEventListener('click', () => {
                this.hideContentWarning();
                this.navigateToPage('browse');
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortContent(e.target.value);
            });
        }

        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    initSearchBar() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Clear previous timeout
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                
                // Debounce search
                this.searchTimeout = setTimeout(() => {
                    if (query.length >= 2) {
                        this.performSearch(query);
                    } else {
                        this.hideSearchResults();
                    }
                }, 300);
            });

            searchInput.addEventListener('focus', () => {
                if (searchInput.value.trim().length >= 2) {
                    this.showSearchResults();
                }
            });

            searchInput.addEventListener('blur', () => {
                // Delay hiding to allow for clicks on results
                setTimeout(() => {
                    this.hideSearchResults();
                }, 200);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = searchInput.value.trim();
                    if (query) {
                        this.navigateToSearch(query);
                    }
                }
            });
        }
    }

    initContentFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterContent(btn.dataset.type);
            });
        });

        // Tag cloud clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                this.filterByTag(e.target.textContent);
            }
        });
    }

    initExplicitToggle() {
        const explicitToggle = document.getElementById('explicitToggle');
        if (explicitToggle) {
            explicitToggle.addEventListener('click', () => {
                this.explicitContentEnabled = !this.explicitContentEnabled;
                this.updateExplicitToggle();
                this.refreshCurrentContent();
            });
        }
    }

    updateExplicitToggle() {
        const toggle = document.getElementById('explicitToggle');
        const toggleIcon = toggle.querySelector('.toggle-icon');
        const toggleText = toggle.querySelector('.toggle-text');
        
        if (this.explicitContentEnabled) {
            toggle.classList.add('enabled');
            toggleIcon.textContent = '✅';
            toggleText.textContent = 'EXPLICIT_FILTER_OFF';
        } else {
            toggle.classList.remove('enabled');
            toggleIcon.textContent = '🚫';
            toggleText.textContent = 'EXPLICIT_FILTER_ON';
        }
    }

    async navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;

            // Load page-specific data
            switch (page) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'browse':
                    await this.loadBrowseContent();
                    break;
                case 'search':
                    this.focusSearchInput();
                    break;
                case 'tags':
                    await this.loadTagExplorer();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
            }
        }
    }

    async loadDashboardData() {
        try {
            // Load statistics
            const stats = await API.getStatistics();
            this.updateDashboardStats(stats);

            // Load recent content
            const recentContent = await API.getWritings({ 
                limit: 6, 
                sort: 'date_desc',
                explicit: this.explicitContentEnabled 
            });
            this.displayRecentContent(recentContent.items);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalWritings').textContent = stats.total_writings || '---';
        document.getElementById('totalWords').textContent = this.formatNumber(stats.total_words) || '---';
        document.getElementById('avgWords').textContent = Math.round(stats.average_words) || '---';
        document.getElementById('uniqueTags').textContent = stats.unique_tags || '---';

        // Update footer stats
        document.getElementById('footerArchiveSize').textContent = stats.total_writings || '---';
        document.getElementById('footerMemory').textContent = Math.round(stats.total_words / 100) + 'KB';
        document.getElementById('footerLastSync').textContent = new Date().toLocaleDateString();

        // Update sidebar system info
        document.getElementById('totalEntries').textContent = stats.total_writings || '---';
        document.getElementById('memoryUsage').textContent = Math.round(stats.total_words / 100) + 'KB';
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString();
    }

    displayRecentContent(content) {
        const container = document.getElementById('recentContent');
        if (!container) return;

        container.innerHTML = '';

        content.forEach(item => {
            if (!this.explicitContentEnabled && item.explicit_content) {
                return; // Skip explicit content if filter is on
            }

            const card = this.createContentCard(item);
            container.appendChild(card);
        });
    }

    createContentCard(item) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.addEventListener('click', () => this.openContent(item));

        const excerpt = item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '');

        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${this.escapeHtml(item.title)}</h3>
                <div class="card-meta">
                    <span class="content-type">${item.content_type.toUpperCase()}</span>
                    ${item.explicit_content ? '<span class="explicit-badge">18+</span>' : ''}
                    <span>${item.word_count} words</span>
                    <span>${this.formatDate(item.file_timestamp)}</span>
                </div>
            </div>
            <div class="card-excerpt">${this.escapeHtml(excerpt)}</div>
            ${item.tags ? `<div class="card-tags">${item.tags.map(tag => `<span class="tag">${this.escapeHtml(tag.name)}</span>`).join('')}</div>` : ''}
        `;

        return card;
    }

    async openContent(item) {
        if (item.explicit_content && !this.explicitContentEnabled) {
            this.currentContent = item;
            this.showContentWarning(item);
            return;
        }

        await this.displayContent(item);
    }

    async displayContent(item, bypassWarning = false) {
        this.navigateToPage('content-viewer');
        
        const contentDisplay = document.getElementById('contentDisplay');
        if (!contentDisplay) return;

        // Format content based on type
        let formattedContent = this.formatContentForDisplay(item.content, item.content_type);

        contentDisplay.innerHTML = `
            <h1 class="content-title">${this.escapeHtml(item.title)}</h1>
            <div class="content-meta">
                <span>${item.content_type.toUpperCase()} • ${item.word_count} words • ${this.formatDate(item.file_timestamp)}</span><br>
                ${item.tags && item.tags.length > 0 ? `<span>Tags: ${item.tags.map(tag => tag.name).join(', ')}</span>` : ''}
            </div>
            <div class="content-text">${formattedContent}</div>
        `;
    }

    formatContentForDisplay(content, type) {
        // Basic formatting based on content type
        switch (type) {
            case 'poetry':
                // Preserve line breaks for poetry
                return content.split('\n').map(line => 
                    line.trim() ? `<p>${this.escapeHtml(line)}</p>` : '<p>&nbsp;</p>'
                ).join('');
            
            case 'dialogue':
                // Format dialogue with proper spacing
                return content.split('\n\n').map(paragraph => 
                    `<p>${this.escapeHtml(paragraph)}</p>`
                ).join('');
            
            default:
                // Default paragraph formatting
                return content.split('\n\n').map(paragraph => 
                    `<p>${this.escapeHtml(paragraph.trim())}</p>`
                ).join('');
        }
    }

    showContentWarning(item) {
        const modal = document.getElementById('contentWarning');
        const contentType = document.getElementById('warningContentType');
        
        if (contentType) {
            contentType.textContent = item.content_type.toUpperCase();
        }
        
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideContentWarning() {
        const modal = document.getElementById('contentWarning');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async loadTagCloud() {
        try {
            const response = await API.getTags();
            // Handle both formats: direct array or {tags: array}
            const tags = response.tags || response;
            const tagCloud = document.getElementById('tagCloud');
            
            if (tagCloud && Array.isArray(tags)) {
                tagCloud.innerHTML = tags.slice(0, 12).map(tag => 
                    `<span class="tag" data-tag="${this.escapeHtml(tag.name)}">${this.escapeHtml(tag.name)}</span>`
                ).join('');
            }
        } catch (error) {
            console.error('Error loading tag cloud:', error);
        }
    }

    async performSearch(query) {
        try {
            const results = await API.search({
                q: query,
                limit: 10,
                include_explicit: this.explicitContentEnabled
            });
            
            this.displaySearchResults(results.items);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            searchResults.innerHTML = results.map(item => `
                <div class="search-result-item" onclick="app.openContent(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <strong>${this.escapeHtml(item.title)}</strong><br>
                    <small>${item.content_type.toUpperCase()} • ${item.word_count} words</small>
                </div>
            `).join('');
        }
        
        this.showSearchResults();
    }

    showSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.remove('hidden');
        }
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
    }

    navigateToSearch(query) {
        this.navigateToPage('search');
        const advancedSearch = document.getElementById('advancedSearch');
        if (advancedSearch) {
            advancedSearch.value = query;
        }
        this.performAdvancedSearch(query);
    }

    async performAdvancedSearch(query) {
        try {
            const results = await API.search({
                q: query,
                limit: 50,
                include_explicit: this.explicitContentEnabled
            });
            
            this.displayAdvancedSearchResults(results);
        } catch (error) {
            console.error('Advanced search error:', error);
            this.showError('Search failed');
        }
    }

    displayAdvancedSearchResults(results) {
        const container = document.getElementById('searchResultsContainer');
        if (!container) return;

        if (results.items.length === 0) {
            container.innerHTML = '<div class="no-results">No matching content found.</div>';
            return;
        }

        container.innerHTML = `
            <div class="search-summary">
                Found ${results.items.length} result${results.items.length !== 1 ? 's' : ''}
            </div>
            <div class="content-grid">
                ${results.items.map(item => this.createContentCard(item).outerHTML).join('')}
            </div>
        `;

        // Re-attach event listeners for the new cards
        container.querySelectorAll('.content-card').forEach(card => {
            const item = results.items.find(i => i.title === card.querySelector('.card-title').textContent);
            if (item) {
                card.addEventListener('click', () => this.openContent(item));
            }
        });
    }

    async filterContent(type) {
        // This would filter the current content display
        console.log('Filtering by type:', type);
        await this.refreshCurrentContent();
    }

    async filterByTag(tagName) {
        console.log('Filtering by tag:', tagName);
        this.navigateToPage('browse');
        // Implementation would filter content by tag
    }

    async refreshCurrentContent() {
        switch (this.currentPage) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'browse':
                await this.loadBrowseContent();
                break;
        }
    }

    async loadBrowseContent() {
        try {
            const content = await API.getWritings({
                limit: 1000,
                explicit: this.explicitContentEnabled
            });
            
            this.displayBrowseContent(content.items);
        } catch (error) {
            console.error('Error loading browse content:', error);
            this.showError('Failed to load content');
        }
    }

    displayBrowseContent(content) {
        const container = document.getElementById('browseContent');
        if (!container) return;

        container.innerHTML = '';

        content.forEach(item => {
            const card = this.createContentCard(item);
            container.appendChild(card);
        });
    }

    changeViewMode(mode) {
        console.log('Changing view mode to:', mode);
        // Implementation for different view modes (cards, list, terminal)
    }

    sortContent(sortBy) {
        console.log('Sorting content by:', sortBy);
        // Implementation for sorting content
    }

    focusSearchInput() {
        const searchInput = document.getElementById('advancedSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }

    handleResize() {
        // Handle responsive layout changes
        console.log('Window resized');
    }

    showError(message) {
        console.error('Application error:', message);
        // Could implement a terminal-style error display
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MusingsApp();
});

// Handle service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}