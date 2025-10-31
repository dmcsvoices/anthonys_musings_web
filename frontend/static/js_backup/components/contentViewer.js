// Content Viewer Component
// This file handles the display of individual content pieces

window.ContentViewer = {
    display: function(item) {
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
    },
    
    formatContentForDisplay: function(content, type) {
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
