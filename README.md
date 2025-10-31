# Anthony's Musings Web

A modern web frontend for Anthony's creative writing platform, featuring content creation, media generation, and intelligent browsing. This application provides an intuitive interface for managing creative writings, generating images and audio through AI workflows, and exploring content with advanced filtering.

## Features

### ✨ **Creative Studio**
- 📝 **Multi-format Content Creation**: Poetry, prose, dialogue, song lyrics, and more
- 🎨 **AI Image Generation**: Generate images from text prompts using ComfyUI workflows
- 🎵 **AI Audio Generation**: Create music and audio content from descriptions
- 🎯 **Smart Prompting**: Context-aware suggestions and prompt optimization
- ⚙️ **Configurable Settings**: Style, tone, length, and collaboration options

### 🔍 **Intelligent Browse Experience**
- **Content Type Filtering**: Switch between text writings, images, and audio with dropdown filter
- **Advanced Search**: Full-text search across all content with live filtering
- **Smart Categories**: Poetry, prose, dialogue, erotica, political, and more
- **Media Previews**:
  - 🖼️ **Image Thumbnails**: Hover-to-zoom, click for full-size modal
  - 🎧 **Audio Players**: Inline preview with waveform visualization
- **Content Discovery**: Browse by explicit content, creation date, and type

### 🎭 **Live Generation Queue**
- **Real-time Monitoring**: Live queue statistics and progress tracking
- **Queue Management**: View pending, processing, and completed generations
- **Status Updates**: Visual indicators for generation progress
- **Error Handling**: Clear feedback for failed generations

### 🎨 **Media Display System**
- **Image Gallery**: Full-screen modal with zoom, metadata, and download options
- **Audio Streaming**: Inline players with progress bars and controls
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Fast Loading**: Lazy-loaded thumbnails and progressive image loading

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, and Vanilla JavaScript
- **Styling**: Custom CSS with gradient themes and smooth animations
- **API Integration**: RESTful communication with FastAPI backend
- **Media Handling**: Direct streaming and thumbnail generation
- **State Management**: LocalStorage for preferences and session persistence

## Media Support

### Image Formats
- PNG, JPEG, GIF, WebP
- Thumbnail generation and full-size viewing
- Zoom and gallery navigation
- Metadata display (generation settings, prompts, file details)

### Audio Formats
- MP3, WAV, OGG, M4A
- Waveform visualization
- Inline preview controls
- Streaming playback without download

## API Integration

The frontend communicates with the Anthony's Musings API through these endpoints:

### Content Management
- `/api/writings` - Text content browsing and search
- `/api/prompts` - Generation request management
- `/api/prompts/{id}/artifacts` - Media artifact retrieval

### Media Serving
- `/api/media/{file_path}` - Secure media file serving
- `/api/queue/stats` - Live generation queue monitoring

### Generation
- `POST /api/prompts` - Submit new generation requests
- `/api/models/available` - Available AI models

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd anthonys-musings-web
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoints and settings
   ```

3. **Serve the application**

   For development:
   ```bash
   # Using Python's built-in server
   cd frontend/static
   python -m http.server 8080

   # Or using Node.js
   npx serve -p 8080
   ```

   For production:
   ```bash
   # Use nginx, Apache, or your preferred web server
   ```

4. **Access the application**
   ```
   http://localhost:8080
   ```

## Configuration

Key environment variables in `.env`:

```bash
# API Configuration
API_BASE_URL=http://localhost:8001
NODE_ENV=development

# Content Settings
MAX_CONTENT_LENGTH=10000000
EXPLICIT_CONTENT_WARNING=true

# Development Settings
HOT_RELOAD=true
LOG_LEVEL=debug

# Production Settings (uncomment for production)
# NODE_ENV=production
# DEBUG=false
# API_BASE_URL=https://your-api-domain.com
```

## Features in Detail

### Content Creation Studio
- **Prompt Types**: Text, Image, Music, Voice, Audio
- **Style Options**: Creative, technical, poetic, conversational
- **Tone Settings**: Professional, casual, humorous, dramatic
- **Length Control**: Brief, moderate, detailed, extensive
- **Collaboration Mode**: Solo or collaborative writing

### Browse Experience
- **Content Source Filter**: All Content, Text Writings, Images, Audio
- **Text Type Filters**: Poetry, Prose, Dialogue, Song Lyrics, Erotica, Satire, Political, Fragments
- **Search**: Real-time search across all content
- **Explicit Content Toggle**: Hide/show adult content

### Media Cards
- **Image Cards**: Thumbnail preview, hover overlay, click for full modal
- **Audio Cards**: Inline player, waveform visualization, play/pause controls
- **Status Indicators**: Processing, completed, failed status badges
- **Metadata Display**: Creation date, artifact count, generation details

## Architecture

```
anthonys-musings-web/
├── frontend/
│   └── static/
│       └── index.html          # Single-page application
├── .env                        # Environment configuration
├── .env.example               # Environment template
├── docker-compose.yml         # Docker deployment
└── README.md                  # This file
```

The application is a single-page application (SPA) built with vanilla JavaScript for maximum performance and minimal dependencies.

## Integration Points

This frontend integrates with:
- **Anthony's Musings API** - Content and media management
- **ComfyUI Service** - AI image and audio generation
- **Poets Service** - Automated content generation workflows

## Development

### Adding New Features
1. **Media Types**: Update the content type filter and card components
2. **Content Types**: Add new categories to the filter system
3. **Generation Models**: Update the model selection in the creation studio

### Styling Guidelines
- Use CSS custom properties for consistent theming
- Follow the existing gradient and color schemes
- Ensure responsive design for all new components
- Add loading states and error handling

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

### GPL-3.0 License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate documentation.

## Support

For issues, questions, or contributions, please open an issue on the project repository.

## Screenshots

*Coming soon: Screenshots of the interface, media browsing, and generation studio.*