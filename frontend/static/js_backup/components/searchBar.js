// Search Bar Component
// This file handles search functionality and autocomplete

window.SearchBar = {
    init: function() {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchInput) return;
        
        let searchTimeout = null;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Debounce search
            searchTimeout = setTimeout(() => {
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
                if (query && window.app) {
                    window.app.navigateToSearch(query);
                }
            }
        });
    },
    
    async performSearch(query) {
        try {
            const results = await API.search({
                q: query,
                limit: 10,
                include_explicit: window.app ? window.app.explicitContentEnabled : false
            });
            
            this.displaySearchResults(results.items || []);
        } catch (error) {
            console.error('Search error:', error);
        }
    },
    
    displaySearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        } else {
            searchResults.innerHTML = results.map(item => `
                <div class="search-result-item" onclick="window.app && window.app.openContent(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <strong>${this.escapeHtml(item.title)}</strong><br>
                    <small>${item.content_type.toUpperCase()} • ${item.word_count} words</small>
                </div>
            `).join('');
        }
        
        this.showSearchResults();
    },
    
    showSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.remove('hidden');
        }
    },

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
    },
    
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
