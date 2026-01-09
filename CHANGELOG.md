# Changelog

All notable changes to Anthony's Musings Web frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed - 2026-01-09

#### Queue Modal Real-time Updates
- **Fixed Queue modal showing stale prompt statuses** ([#commit-7edbe57](../../commit/7edbe57))
  - Added auto-refresh every 5 seconds while Queue modal is open
  - Created `refreshQueueModal()` function to update content without reopening
  - Added `closeQueueModal()` function to properly clean up refresh interval
  - Updated modal close handlers to stop auto-refresh when closed
  - **Impact**: Queue modal now shows real-time status changes without manual refresh
  - Prompts automatically disappear from "Queued" section when processed by Poets service
  - No need to close and reopen modal to see updated statuses

#### Browse Tab Audio Display
- **Fixed Browse tab Audio filter not displaying audio files** ([#commit-4d21648](../../commit/4d21648))
  - Updated `loadAudioPrompts()` to query for `lyrics_prompt` type in addition to `music`, `audio`, `voice`
  - Updated `loadImagePrompts()` to query for `image_prompt` instead of `image`
  - Updated `loadAllContent()` to use correct prompt type queries
  - Fixed `displayMixedContent()` to recognize `lyrics_prompt` as audio media type
  - **Impact**: Browse > Content Type: Audio now correctly displays generated song files

- **Fixed nginx routing priority for API requests** ([#commit-4871220](../../commit/4871220))
  - Moved API proxy configuration before static file caching rules
  - Updated static file caching regex to explicitly exclude `/api/` paths
  - **Impact**: Ensures API requests are not incorrectly cached, fixing data retrieval issues

### Technical Details

#### Prompt Type Naming Convention
The application now properly handles the updated prompt type naming:
- `image_prompt` - AI-generated structured image generation prompts
- `lyrics_prompt` - AI-generated structured song/lyrics generation prompts
- Previously used legacy types: `image`, `song`, `music`, `audio`, `voice`

#### API Query Updates
JavaScript functions updated to query correct prompt types:

**Before:**
```javascript
fetch('/api/prompts?prompt_type=music,audio,voice&status=completed')
fetch('/api/prompts?prompt_type=image&status=completed')
```

**After:**
```javascript
fetch('/api/prompts?prompt_type=lyrics_prompt,music,audio,voice&status=completed')
fetch('/api/prompts?prompt_type=image_prompt&status=completed')
```

#### Media Type Detection
Updated media type detection logic:
```javascript
const mediaType = ['lyrics_prompt', 'music', 'audio', 'voice'].includes(prompt.prompt_type) ? 'audio' : 'image';
```

### Audio File Support
The Browse tab now correctly displays:
- Generated song files from `lyrics_prompt` type prompts
- Inline audio player with play/pause controls
- Waveform visualization animation
- Audio metadata (title, genre, mood, tempo, instrumentation)
- Supports WAV, MP3, OGG, and M4A formats

### Testing Performed
- ✅ Browse > Audio shows lyrics_prompt audio files
- ✅ Browse > Images shows image_prompt image files
- ✅ Audio playback streams correctly from `/api/media/` endpoint
- ✅ Waveform visualization animates during playback
- ✅ API routing prioritization works correctly
- ✅ No caching issues with API requests

---

## Version History

*This CHANGELOG was created on 2026-01-09. Previous changes are not documented but may be found in git history.*
