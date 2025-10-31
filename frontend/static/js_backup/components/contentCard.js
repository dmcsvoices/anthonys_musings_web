// Content Card Component
// This file provides utilities for creating and managing content cards

window.ContentCard = {
    create: function(item) {
        const card = document.createElement('div');
        card.className = 'content-card';
        
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
            ${item.tags && item.tags.length > 0 ? `<div class="card-tags">${item.tags.map(tag => `<span class="tag">${this.escapeHtml(tag.name)}</span>`).join('')}</div>` : ''}
        `;
        
        return card;
    },
    
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};
