# Exercise Database Integration in Explore Chat

## Overview
Integrated the exercise database (`json2/` and `json2_no/` folders) into the explore assistant chat, allowing users to query exercises directly in conversation with automatic card display and video playback.

---

## Architecture

### Backend Flow
```
User asks about exercises
  ↓
LLM outputs: "Here are some shoulder exercises: <<EXERCISE_QUERY:Shoulders:rotator cuff>>"
  ↓
StreamParser detects marker → calls /api/exercises/search
  ↓
Returns 3 exercises → emits SSE event type:'exercises'
  ↓
Frontend receives → displays ExerciseChatCards
```

### Frontend Flow
```
useChat receives 'exercises' SSE event
  ↓
Updates exerciseResults state
  ↓
Passed to ChatMessages component
  ↓
Renders ExerciseChatCard for each exercise
  ↓
User clicks video → triggers onVideoClick handler
```

---

## Components Created/Modified

### **NEW: `/api/exercises/search/route.ts`**
- **Purpose**: Server-side API to search exercises by body part and query
- **Input**: `{ bodyParts: string[], query: string, limit: number, locale: string }`
- **Output**: `{ exercises: Exercise[], total: number, showing: number }`
- **Features**:
  - Fetches from `json2/` or `json2_no/` based on locale
  - Fuzzy search by name/description/muscles
  - Deduplication by exercise ID
  - Configurable result limit (default: 6)

### **NEW: `ExerciseChatCard.tsx`**
- **Purpose**: Compact exercise card optimized for inline chat display
- **Features**:
  - Collapsible details (description, steps, tips)
  - Video play button with loading state
  - Metrics display (sets/reps or duration)
  - Body part tag
  - Maximum 3 steps shown (expandable)
  - Precaution warnings

### **MODIFIED: `stream-parser.ts`**
- Added `onExercises` callback
- Added `locale` parameter to constructor
- New `detectAndFetchExercises()` method:
  - Detects `<<EXERCISE_QUERY:bodypart:query>>` markers
  - Calls `/api/exercises/search` API
  - Emits exercises via SSE

### **MODIFIED: `route.ts` (assistant API)**
- Updated `StreamParser` instantiation to pass `locale`
- Added `onExercises` callback to emit `{ type: 'exercises', exercises, query }` SSE events
- Made `parser.complete()` async to await exercise fetching

### **MODIFIED: `useChat.ts`**
- Added `exerciseResults` state: `Exercise[]`
- Added handler for `type: 'exercises'` SSE events
- Returns `exerciseResults` from hook

### **MODIFIED: `usePartChat.ts`**
- Passes through `exerciseResults` from `useChat`
- Returns in hook interface

### **MODIFIED: `ChatMessages.tsx`**
- Added `exerciseResults` and `onVideoClick` props
- Renders `ExerciseChatCard` components above follow-up questions
- Passes `loadingVideoExercise` state for spinner

### **MODIFIED: `explorePrompt.ts`**
- Added **Rule 8: Exercise Database Integration**
- Taught LLM the `<<EXERCISE_QUERY:bodypart:query>>` syntax
- Listed valid body part names
- Examples for common queries
- Instructions to never list exercise names in text (cards display them)

---

## LLM Query Syntax

### Marker Format
```
<<EXERCISE_QUERY:bodypart:query>>
```

### Body Part Names (case-sensitive)
- `Shoulders`
- `Upper Arms`
- `Forearms`
- `Chest`
- `Abdomen`
- `Upper Back`
- `Lower Back`
- `Glutes`
- `Upper Legs`
- `Lower Legs`
- `Warmup`
- `Cardio`

### Examples
| User Question | LLM Output |
|--------------|-----------|
| "Show me shoulder exercises" | `<<EXERCISE_QUERY:Shoulders:>>` |
| "I need rotator cuff exercises" | `<<EXERCISE_QUERY:Shoulders:rotator cuff>>` |
| "What are good quad exercises?" | `<<EXERCISE_QUERY:Upper Legs:quad>>` |
| "Show glute exercises" | `<<EXERCISE_QUERY:Glutes:>>` |
| "Warmup exercises" | `<<EXERCISE_QUERY:Warmup:>>` |

---

## Data Flow

### Exercise Search Request
```typescript
POST /api/exercises/search
{
  bodyParts: ["Shoulders"],
  query: "rotator cuff",
  limit: 3,
  locale: "en"
}
```

### Exercise Search Response
```typescript
{
  exercises: [
    {
      id: "shoulders-42",
      name: "External Rotation with Band",
      description: "...",
      steps: ["...", "..."],
      tips: ["..."],
      videoUrl: "gs://...",
      sets: 3,
      repetitions: 12,
      bodyPart: "Shoulders",
      ...
    }
  ],
  total: 15,
  showing: 3
}
```

### SSE Event
```json
{
  "type": "exercises",
  "exercises": [...],
  "query": "rotator cuff"
}
```

---

## Video Handling

### Requirements
Components using `ChatMessages` with exercise cards need:
1. State: `loadingVideoExercise: string | null`
2. State: `videoUrl: string | null`
3. Handler: `onVideoClick: (exercise: Exercise) => Promise<void>`
4. Modal/Player: Video display component

### Example Implementation
```typescript
const [videoUrl, setVideoUrl] = useState<string | null>(null);
const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);

const handleVideoClick = async (exercise: Exercise) => {
  const exerciseId = exercise.name || exercise.id;
  if (loadingVideoExercise === exerciseId) return;
  
  setLoadingVideoExercise(exerciseId);
  try {
    if (exercise.videoUrl && isFirebaseStorageUrl(exercise.videoUrl)) {
      const storageRef = ref(storage, exercise.videoUrl);
      const downloadUrl = await getDownloadURL(storageRef);
      setVideoUrl(downloadUrl);
    } else {
      const youtubeUrl = await searchYouTubeVideo(`${exercise.name} proper form`);
      setVideoUrl(getVideoEmbedUrl(youtubeUrl));
    }
  } catch (error) {
    console.error('Error fetching video:', error);
  } finally {
    setLoadingVideoExercise(null);
  }
};

// Pass to ChatMessages
<ChatMessages
  {...otherProps}
  exerciseResults={exerciseResults}
  onVideoClick={handleVideoClick}
  loadingVideoExercise={loadingVideoExercise}
/>
```

---

## Testing

### Manual Test Cases
1. **Basic Query**: Ask "Show me shoulder exercises" → Should display 3 exercise cards
2. **Specific Query**: Ask "I need rotator cuff exercises" → Should display targeted exercises
3. **Norwegian**: Switch to Norwegian, ask "Vis meg skulderøvelser" → Should fetch from `json2_no/`
4. **Video Play**: Click video button → Should load and display video
5. **Expand Details**: Click exercise card → Should expand to show steps/tips
6. **Multiple Queries**: Ask about shoulders, then glutes → Should update exercise list

### Edge Cases
- Empty query: `<<EXERCISE_QUERY:Shoulders:>>` → Returns all shoulder exercises (up to 3)
- Invalid body part: `<<EXERCISE_QUERY:InvalidPart:>>` → Returns empty array
- No exercises found: Query doesn't match any → Returns empty array
- Network error: API fails → Logs warning, doesn't crash

---

## Locale Support

### Files
- **English**: `/data/exercises/musco/json2/*.json`
- **Norwegian**: `/data/exercises/musco/json2_no/*.json`

### Automatic Selection
```typescript
const useNorwegian = locale.startsWith('no') || locale.startsWith('nb');
```

---

## Performance Considerations

1. **Limit Results**: Default 3 exercises per query (chat context)
2. **Caching**: Exercise JSON files served with `cache: 'force-cache'`
3. **Deduplication**: Exercises deduped by ID before return
4. **Progressive Display**: Cards render as SSE events arrive
5. **Lazy Video Loading**: Videos only fetched on user click

---

## Future Enhancements

- [ ] Add exercise cards to program page
- [ ] Allow users to save exercises to custom programs
- [ ] Add filters (difficulty, equipment) to search
- [ ] Cache search results in session storage
- [ ] Preload exercise videos when cards appear
- [ ] Add "Show more" button to load additional exercises
- [ ] Track exercise card clicks in analytics

---

## Troubleshooting

### Exercise Cards Not Appearing
1. Check LLM output contains `<<EXERCISE_QUERY:...>>` marker
2. Verify body part name matches exactly (case-sensitive)
3. Check browser console for API errors
4. Verify exercise JSON files exist in `public/data/exercises/musco/json2/`

### Wrong Language
1. Check `locale` prop passed to `StreamParser`
2. Verify locale detection: `locale.startsWith('no')`
3. Check Norwegian files exist in `json2_no/`

### Video Not Loading
1. Implement `onVideoClick` handler in parent component
2. Pass `loadingVideoExercise` state to `ChatMessages`
3. Check Firebase storage permissions
4. Verify YouTube API key configured

---

## Files Modified Summary
- ✅ `src/app/api/exercises/search/route.ts` (NEW)
- ✅ `src/app/components/ui/ExerciseChatCard.tsx` (NEW)
- ✅ `src/app/api/assistant/stream-parser.ts`
- ✅ `src/app/api/assistant/route.ts`
- ✅ `src/app/hooks/useChat.ts`
- ✅ `src/app/hooks/usePartChat.ts`
- ✅ `src/app/components/ui/ChatMessages.tsx`
- ✅ `src/app/components/3d/MobileControls.tsx`
- ✅ `src/app/api/prompts/explorePrompt.ts`
- ⚠️ `src/app/components/ui/PartPopup.tsx` (needs `onVideoClick` handler)
- ⚠️ `src/app/components/3d/MobileControls.tsx` (needs `onVideoClick` handler)

---

**Status**: Core integration complete. Video handlers need to be implemented in `PartPopup` and `MobileControls` following the pattern from `program/day/[day]/page.tsx`.





