# Frontend Optimization Migration Checklist

## Phase 1: Foundation Setup (1-2 hours)

### 1.1 Router Migration
- [ ] Backup current router: `mv src/router/index.jsx src/router/index.backup.jsx`
- [ ] Activate optimized router: `mv src/router/index.optimized.jsx src/router/index.jsx`
- [ ] Test all routes manually
- [ ] Verify lazy loading in Network tab (chunks load on demand)

### 1.2 Test Core Utilities
- [ ] Import test: `import { LRUCache, useDebounce } from '@/core';`
- [ ] Create small test component using one hook
- [ ] Verify no console errors

### 1.3 Add Preloading
File: `src/pages/Login/Login.jsx`
```javascript
import { preloadCommonRoutes } from '@/router';

// After successful login (find line with navigate or history.push)
const handleLoginSuccess = () => {
  // ... existing login code
  preloadCommonRoutes(); // Add this line
  navigate('/common/dashboard');
};
```

---

## Phase 2: High-Traffic Pages (2-3 hours)

### 2.1 Dashboard Optimization

**File**: `src/pages/Dashboard/Common/CommonDashboar.jsx`

Add performance monitoring:
```javascript
import { withPerformance } from '@/core';

const CommonDashboard = () => {
  // ... existing code
};

export default withPerformance(CommonDashboard, 'CommonDashboard');
```

If Dashboard has Search:
```javascript
import { useSearch } from '@/core';

const { searchTerm, setSearchTerm, results, isSearching } = useSearch({
  searchFn: async (term) => {
    const response = await apiClient.get(`/api/search?q=${term}`);
    return response.data;
  },
  debounceMs: 300,
  minLength: 2
});
```

If Dashboard has Large Table (>100 rows):
```javascript
import { useVirtualScroll, usePagination } from '@/core';

// Option 1: Virtual scrolling (for >500 items)
const { visibleItems, containerRef, totalHeight } = useVirtualScroll({
  items: data,
  itemHeight: 60,
  overscan: 3
});

// Option 2: Pagination (for 100-500 items)
const { currentPage, pageData, totalPages, goToPage, nextPage, prevPage } = usePagination({
  items: data,
  pageSize: 20
});
```

### 2.2 Valuation Pages

**Files**: 
- `src/pages/Valuation/ValuationMain.jsx`
- `src/pages/Valuation/ValuationchiefMain.jsx`

Replace Array.find with FastIndex (for frequent lookups):
```javascript
import { FastIndex } from '@/core';

// Before (O(n) - slow)
const examiner = examiners.find(e => e.id === examinerId);

// After (O(1) - fast)
const examinerIndex = new FastIndex(examiners, 'id');
const examiner = examinerIndex.get(examinerId);
```

Add debouncing to form inputs:
```javascript
import { useDebounce } from '@/core';

const [marks, setMarks] = useState('');
const debouncedMarks = useDebounce(marks, 500);

useEffect(() => {
  // This only runs after 500ms of no changes
  if (debouncedMarks) {
    saveMarks(debouncedMarks);
  }
}, [debouncedMarks]);
```

---

## Phase 3: Data Tables (1-2 hours)

### 3.1 Excel Upload Page

**File**: `src/pages/ExcelTextUpload/ExcelTextUpload.jsx`

Add pagination hook:
```javascript
import { usePagination, useFilteredData, useSortedData } from '@/core';

const [uploadedFiles, setUploadedFiles] = useState([]);

// Filtering
const { filtered, setFilter } = useFilteredData(
  uploadedFiles,
  (item, filter) => item.name.toLowerCase().includes(filter.toLowerCase())
);

// Sorting
const { sorted, sortBy } = useSortedData(filtered, 'date', 'desc');

// Pagination
const { pageData, currentPage, totalPages, goToPage } = usePagination({
  items: sorted,
  pageSize: 20
});
```

### 3.2 Examiner Review

**File**: `src/pages/Dashboard/Examinerreview/ExaminerReview.jsx`

If displaying list of papers to review:
```javascript
import { useVirtualScroll } from '@/core';

// For lists >100 items
const { visibleItems, containerRef, totalHeight } = useVirtualScroll({
  items: papersToReview,
  itemHeight: 80,
  overscan: 5
});

return (
  <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
    <div style={{ height: totalHeight }}>
      {visibleItems.map(({ data, index }) => (
        <PaperRow key={data.id} paper={data} />
      ))}
    </div>
  </div>
);
```

---

## Phase 4: Redux Optimization (2-3 hours)

### 4.1 Normalize State Structure

**File**: `src/redux-slice/examinerSlice.js` (example)

Before:
```javascript
const initialState = {
  examiners: [] // Array of examiner objects
};
```

After (normalized):
```javascript
import { createNormalizedReducer, normalizeData } from '@/core';

const initialState = {
  byId: {},      // { '1': { id: '1', name: 'John' }, '2': { ... } }
  allIds: []     // ['1', '2', '3']
};

// In reducer
const examinerSlice = createSlice({
  name: 'examiner',
  initialState,
  reducers: {
    setExaminers: (state, action) => {
      const normalized = normalizeData(action.payload, 'id');
      state.byId = normalized.byId;
      state.allIds = normalized.allIds;
    }
  }
});
```

### 4.2 Memoized Selectors

**File**: Create `src/store/selectors/examinerSelectors.js`

```javascript
import { createIndexedSelector, createFilteredSelector } from '@/core';

// O(1) lookup by ID
export const selectExaminerById = createIndexedSelector(
  state => state.examiner.byId,
  'id'
);

// Filtered list (memoized)
export const selectActiveExaminers = createFilteredSelector(
  state => Object.values(state.examiner.byId),
  examiner => examiner.status === 'active'
);

// Grouped list (memoized)
export const selectExaminersBySubject = createGroupedSelector(
  state => Object.values(state.examiner.byId),
  'subjectId'
);
```

---

## Phase 5: API Layer (1-2 hours)

### 5.1 Replace Axios with APIClient

**Before** (in any component):
```javascript
import axios from 'axios';

const fetchExaminers = async () => {
  const response = await axios.get('/api/examiners');
  return response.data;
};
```

**After**:
```javascript
import { apiClient } from '@/core';

const fetchExaminers = async () => {
  const response = await apiClient.get('/api/examiners');
  return response.data; // Automatically cached, retried, monitored
};
```

### 5.2 Batch Parallel Requests

**File**: `src/pages/Dashboard/Admin/AdminMainDashboard.jsx`

Before (sequential - slow):
```javascript
const loadData = async () => {
  const examiners = await fetchExaminers();
  const valuations = await fetchValuations();
  const subjects = await fetchSubjects();
  return { examiners, valuations, subjects };
};
```

After (parallel - fast):
```javascript
import { parallelRequests, apiClient } from '@/core';

const loadData = async () => {
  const [examiners, valuations, subjects] = await parallelRequests([
    () => apiClient.get('/api/examiners'),
    () => apiClient.get('/api/valuations'),
    () => apiClient.get('/api/subjects')
  ], { concurrency: 5 });
  
  return { examiners, valuations, subjects };
};
```

---

## Phase 6: Component Optimization (2-3 hours)

### 6.1 Memoize Expensive Components

```javascript
import { memo } from 'react';
import { withPerformance } from '@/core';

const ExpensiveComponent = memo(({ data }) => {
  // ... component code
});

export default withPerformance(ExpensiveComponent, 'ExpensiveComponent');
```

### 6.2 Use useCallback for Functions

```javascript
import { useCallback } from 'react';
// OR
import { useMemoizedCallback } from '@/core';

// Option 1: React's useCallback
const handleSubmit = useCallback((data) => {
  saveData(data);
}, [saveData]);

// Option 2: Our optimized version
const handleSubmit = useMemoizedCallback((data) => {
  saveData(data);
}, [saveData]);
```

### 6.3 Add Error Boundaries

**File**: `src/pages/Valuation/ValuationMain.jsx`

```javascript
import { withErrorBoundary } from '@/core';

const ValuationMain = () => {
  // ... component code
};

export default withErrorBoundary(ValuationMain, {
  onError: (error, errorInfo) => {
    // Log to error tracking service
    console.error('Valuation error:', error);
  }
});
```

---

## Phase 7: Build Optimization (30 mins)

### 7.1 Update Vite Config

```bash
cd frontend
mv vite.config.js vite.config.backup.js
mv vite.config.optimized.js vite.config.js
```

### 7.2 Test Production Build

```bash
npm run build
npm run preview
```

Check console for:
- [ ] No errors
- [ ] Chunk size <500KB
- [ ] Total bundle size reduced

---

## Phase 8: Testing & Verification (1-2 hours)

### 8.1 Performance Testing

Open Chrome DevTools:
1. **Network Tab**: Verify chunks load on demand
2. **Performance Tab**: Record and check for:
   - First Contentful Paint <1.5s
   - Time to Interactive <3s
   - No long tasks >50ms
3. **Lighthouse**: Run audit, aim for score >90

### 8.2 Functionality Testing

Test critical user flows:
- [ ] Login → Dashboard
- [ ] Dashboard → Valuation
- [ ] Search functionality
- [ ] Filter/Sort on tables
- [ ] PDF generation
- [ ] Excel upload
- [ ] Save/Update operations

### 8.3 Error Testing

- [ ] Network offline → Proper error message
- [ ] API returns 500 → Error boundary catches
- [ ] Invalid data → Validation works
- [ ] Chunk fails to load → Retry works

---

## Phase 9: Monitoring (Ongoing)

### 9.1 Enable Performance Monitoring

**File**: `src/constants/index.js`

```javascript
export const FEATURE_FLAGS = {
  ENABLE_PERFORMANCE_MONITORING: true,
};
```

### 9.2 Check Browser Console

Look for warnings:
- `[Performance] Component rendered X times`
- `[Performance] Component render took Yms`
- `[Cache] Hit rate: X%`

### 9.3 Monitor Real Users

Add analytics (optional):
```javascript
import { perfMonitor } from '@/core';

// Track page load
perfMonitor.start('page-load');
// ... page loads
const loadTime = perfMonitor.measure('page-load');

// Send to analytics
sendToAnalytics('page-load', loadTime);
```

---

## Rollback Plan (If Issues Occur)

### Quick Rollback
```bash
cd frontend/src/router
mv index.jsx index.new.jsx
mv index.backup.jsx index.jsx

cd ../..
mv vite.config.js vite.config.new.js
mv vite.config.backup.js vite.config.js

npm run dev
```

### Gradual Rollback
1. Keep optimized router, remove file by file
2. Comment out imports from @/core
3. Restore original components one by one

---

## Success Metrics

After full migration, you should see:

| Metric | Target |
|--------|--------|
| Initial Bundle Size | <600KB (from ~2MB) |
| Route Transition | <100ms |
| Large List Render | <50ms |
| Search Response | <50ms (after debounce) |
| Lighthouse Score | >90 |
| Component Renders | <10 per interaction |

---

## Priority Order

**Must Do** (Core improvements):
1. ✅ Router migration (lazy loading)
2. ✅ Preload common routes
3. ✅ Virtual scrolling for large lists
4. ✅ Debounce search inputs

**Should Do** (Significant gains):
5. Replace Array.find with FastIndex
6. Normalize Redux state
7. Use memoized selectors
8. Batch API requests

**Nice to Have** (Incremental gains):
9. Add error boundaries
10. Memoize expensive components
11. Update Vite config
12. Enable performance monitoring

---

## Estimated Timeline

- **Minimal (just router)**: 1-2 hours
- **Core optimizations**: 1 day
- **Full migration**: 2-3 days
- **With testing**: 1 week

---

## Questions / Issues?

Common issues:
1. **Import errors**: Check if using `@/core` (may need path alias in vite.config)
2. **Type errors**: Add JSDoc comments or TypeScript definitions
3. **Cache issues**: Clear localStorage, check ENABLE_CACHE flag
4. **Lazy load fails**: Check network tab for chunk errors, verify import paths

---

Ready to boost performance by 60-95%! 🚀
