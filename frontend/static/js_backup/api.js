// Anthony's Musings - API Communication Layer

class APIClient {
    constructor() {
        // Determine base URL based on environment
        this.baseURL = this.getBaseURL();
        this.timeout = 10000; // 10 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    getBaseURL() {
        // In development, the API is proxied through nginx to /api/
        // In production, same setup
        return '/api';
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.timeout
        };

        const finalOptions = { ...defaultOptions, ...options };

        // Add body for POST/PUT requests
        if (finalOptions.body && typeof finalOptions.body === 'object') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`API Request [${attempt}/${this.retryAttempts}]: ${finalOptions.method} ${url}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...finalOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new APIError(
                        `HTTP ${response.status}: ${response.statusText}`,
                        response.status,
                        errorData
                    );
                }

                const data = await response.json();
                console.log(`API Response: ${finalOptions.method} ${url}`, data);
                return data;

            } catch (error) {
                console.error(`API Error [${attempt}/${this.retryAttempts}]:`, error);

                if (attempt === this.retryAttempts) {
                    throw error;
                }

                // Wait before retrying
                await this.delay(this.retryDelay * attempt);
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // GET requests
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return await this.makeRequest(url);
    }

    // POST requests
    async post(endpoint, data = {}) {
        return await this.makeRequest(endpoint, {
            method: 'POST',
            body: data
        });
    }

    // PUT requests
    async put(endpoint, data = {}) {
        return await this.makeRequest(endpoint, {
            method: 'PUT',
            body: data
        });
    }

    // DELETE requests
    async delete(endpoint) {
        return await this.makeRequest(endpoint, {
            method: 'DELETE'
        });
    }

    // CONTENT MANAGEMENT ENDPOINTS

    /**
     * Get all writings with optional filtering
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number (default: 1)
     * @param {number} params.limit - Items per page (default: 20)
     * @param {string} params.content_type - Filter by content type
     * @param {string} params.publication_status - Filter by publication status
     * @param {boolean} params.explicit - Include explicit content
     * @param {string} params.sort - Sort order
     */
    async getWritings(params = {}) {
        return await this.get('/writings', params);
    }

    /**
     * Get a specific writing by ID
     * @param {number} id - Writing ID
     */
    async getWriting(id) {
        return await this.get(`/writings/${id}`);
    }

    /**
     * Get writings by content type
     * @param {string} contentType - Content type
     * @param {Object} params - Additional parameters
     */
    async getWritingsByType(contentType, params = {}) {
        return await this.get(`/writings/type/${contentType}`, params);
    }

    /**
     * Get writings by publication status
     * @param {string} status - Publication status
     * @param {Object} params - Additional parameters
     */
    async getWritingsByStatus(status, params = {}) {
        return await this.get(`/writings/status/${status}`, params);
    }

    /**
     * Get writings by tag
     * @param {string} tagName - Tag name
     * @param {Object} params - Additional parameters
     */
    async getWritingsByTag(tagName, params = {}) {
        return await this.get(`/writings/tag/${encodeURIComponent(tagName)}`, params);
    }

    /**
     * Get today's writings
     */
    async getTodaysWritings() {
        return await this.get('/writings/today');
    }

    /**
     * Create a new writing
     * @param {Object} writingData - Writing data
     */
    async createWriting(writingData) {
        return await this.post('/writings', writingData);
    }

    /**
     * Update an existing writing
     * @param {number} id - Writing ID
     * @param {Object} writingData - Updated writing data
     */
    async updateWriting(id, writingData) {
        return await this.put(`/writings/${id}`, writingData);
    }

    /**
     * Delete a writing
     * @param {number} id - Writing ID
     */
    async deleteWriting(id) {
        return await this.delete(`/writings/${id}`);
    }

    // SEARCH ENDPOINTS

    /**
     * Search writings
     * @param {Object} params - Search parameters
     * @param {string} params.q - Search query
     * @param {string} params.content_type - Filter by content type
     * @param {number} params.limit - Max results (default: 20)
     * @param {boolean} params.include_explicit - Include explicit content
     */
    async search(params = {}) {
        return await this.get('/search', params);
    }

    // ANALYTICS ENDPOINTS

    /**
     * Get database statistics
     */
    async getStatistics() {
        return await this.get('/stats');
    }

    /**
     * Get analytics trends
     * @param {Object} params - Analytics parameters
     * @param {string} params.period - Time period (day, week, month, year)
     * @param {string} params.content_type - Filter by content type
     */
    async getAnalyticsTrends(params = {}) {
        return await this.get('/analytics/trends', params);
    }

    /**
     * Get content distribution analytics
     */
    async getContentDistribution() {
        return await this.get('/analytics/distribution');
    }

    // TAG MANAGEMENT ENDPOINTS

    /**
     * Get all tags
     * @param {Object} params - Query parameters
     * @param {string} params.type - Filter by tag type
     */
    async getTags(params = {}) {
        return await this.get('/tags', params);
    }

    /**
     * Get writings for a specific tag
     * @param {string} tagName - Tag name
     * @param {Object} params - Additional parameters
     */
    async getTagWritings(tagName, params = {}) {
        return await this.get(`/tags/${encodeURIComponent(tagName)}/writings`, params);
    }

    /**
     * Create a new tag
     * @param {Object} tagData - Tag data
     */
    async createTag(tagData) {
        return await this.post('/tags', tagData);
    }

    /**
     * Update a tag
     * @param {number} id - Tag ID
     * @param {Object} tagData - Updated tag data
     */
    async updateTag(id, tagData) {
        return await this.put(`/tags/${id}`, tagData);
    }

    // UTILITY METHODS

    /**
     * Check API health
     */
    async healthCheck() {
        try {
            const response = await fetch('/health');
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    /**
     * Get API status and connection info
     */
    async getConnectionStatus() {
        try {
            await this.healthCheck();
            return {
                status: 'online',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'offline',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // MOCK DATA METHODS (for development/testing)

    /**
     * Generate mock statistics for testing
     */
    getMockStatistics() {
        return {
            total_writings: 247,
            total_words: 89430,
            average_words: 362,
            unique_tags: 45,
            content_type_distribution: {
                poetry: { count: 89, explicit: 5 },
                prose: { count: 67, explicit: 12 },
                dialogue: { count: 45, explicit: 18 },
                erotica: { count: 23, explicit: 23 },
                song: { count: 15, explicit: 2 },
                fragment: { count: 8, explicit: 1 }
            },
            publication_status_distribution: {
                draft: 123,
                ready: 98,
                explicit: 26
            }
        };
    }

    /**
     * Generate mock content for testing
     */
    getMockContent() {
        return [
            {
                id: 1,
                title: "Digital Dreams in Silicon Sleep",
                content_type: "poetry",
                content: "In circuits deep where data flows like streams of conscious light,\nElectric dreams pulse through the night,\nWhile silicon minds in slumber deep\nProcess thoughts they cannot keep.\n\nBinary hearts beat one and zero,\nEvery algorithm a hero\nFighting entropy's cold embrace,\nSeeking meaning in cyberspace.",
                word_count: 245,
                character_count: 1205,
                line_count: 16,
                mood: "contemplative",
                explicit_content: false,
                publication_status: "ready",
                file_timestamp: "2025-05-28T10:30:00Z",
                tags: [
                    { id: 1, name: "technology", type: "subject" },
                    { id: 2, name: "dreams", type: "theme" },
                    { id: 3, name: "ai", type: "subject" }
                ]
            },
            {
                id: 2,
                title: "Midnight Conversations",
                content_type: "dialogue",
                content: "\"Tell me about the space between words,\" she whispered into the darkness.\n\n\"It's where thoughts live before they become real,\" he replied, his voice soft against her ear.\n\n\"And what do they dream about in that space?\"\n\n\"They dream about becoming poetry.\"",
                word_count: 192,
                character_count: 892,
                line_count: 8,
                mood: "intimate",
                explicit_content: true,
                publication_status: "ready",
                file_timestamp: "2025-05-27T22:45:00Z",
                tags: [
                    { id: 4, name: "intimate", type: "mood" },
                    { id: 5, name: "conversation", type: "format" },
                    { id: 6, name: "anthony", type: "character" }
                ]
            }
        ];
    }

    /**
     * Generate mock tags for testing
     */
    getMockTags() {
        return [
            { id: 1, name: "anthony", count: 45, type: "character" },
            { id: 2, name: "technology", count: 32, type: "subject" },
            { id: 3, name: "love", count: 28, type: "theme" },
            { id: 4, name: "digital", count: 24, type: "setting" },
            { id: 5, name: "dreams", count: 22, type: "theme" },
            { id: 6, name: "ai", count: 19, type: "subject" },
            { id: 7, name: "future", count: 17, type: "setting" },
            { id: 8, name: "relationship", count: 15, type: "theme" },
            { id: 9, name: "consciousness", count: 13, type: "philosophy" },
            { id: 10, name: "intimacy", count: 11, type: "mood" }
        ];
    }
}

// Custom Error class for API errors
class APIError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Create global API instance
window.API = new APIClient();

// Development mode helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🚀 Anthony\'s Musings API Client initialized in development mode');
    
    // Add some development utilities to window
    window.APIUtils = {
        // Test API connection
        async testConnection() {
            try {
                const status = await API.getConnectionStatus();
                console.log('API Connection Status:', status);
                return status;
            } catch (error) {
                console.error('API Connection Test Failed:', error);
                return { status: 'error', error: error.message };
            }
        },
        
        // Load mock data for testing
        async loadMockData() {
            console.log('Loading mock data for development...');
            return {
                stats: API.getMockStatistics(),
                content: API.getMockContent(),
                tags: API.getMockTags()
            };
        },
        
        // Test all API endpoints
        async testAllEndpoints() {
            console.log('Testing all API endpoints...');
            const results = {};
            
            try {
                results.health = await API.healthCheck();
                results.stats = await API.getStatistics();
                results.writings = await API.getWritings({ limit: 5 });
                results.tags = await API.getTags();
                results.search = await API.search({ q: 'test', limit: 5 });
            } catch (error) {
                console.error('Endpoint test failed:', error);
                results.error = error.message;
            }
            
            console.log('API Endpoint Test Results:', results);
            return results;
        }
    };
}

// Monitor API connection status
let connectionCheckInterval;

function startConnectionMonitoring() {
    connectionCheckInterval = setInterval(async () => {
        const status = await API.getConnectionStatus();
        const statusIndicator = document.getElementById('connectionStatus');
        const statusText = document.querySelector('.status-text');
        
        if (statusIndicator && statusText) {
            if (status.status === 'online') {
                statusIndicator.className = 'status-indicator';
                statusText.textContent = 'ONLINE';
            } else {
                statusIndicator.className = 'status-indicator offline';
                statusText.textContent = 'OFFLINE';
            }
        }
    }, 30000); // Check every 30 seconds
}

function stopConnectionMonitoring() {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
}

// Start monitoring when page loads
document.addEventListener('DOMContentLoaded', () => {
    startConnectionMonitoring();
});

// Stop monitoring when page unloads
window.addEventListener('beforeunload', () => {
    stopConnectionMonitoring();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, APIError };
}