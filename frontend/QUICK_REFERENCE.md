# 🚀 Frontend Optimization Quick Reference

## Import Patterns

```javascript
// ✅ ONE import from barrel export
import { 
  useDebounce, 
  usePagination, 
  FastIndex,
  apiClient,
  withPerformance 
} from '@/core';

// ❌ Don't import from individual files
import { useDebounce } from '../core/hooks';
```

---

## Common Patterns Cheat Sheet

### 🔍 Search with Debouncing

```javascript
const { searchTerm, setSearchTerm, results, isSearching } = useSearch({
  searchFn: async (term) => apiClient.get(`/api/search?q=${term}`),
  debounceMs: 300,
  minLength: 2,
  cache: true
});

return <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
```

### 📄 Pagination

```javascript
const { pageData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination({
  items: data,
  pageSize: 20,
  prefetch: true
});

return (
  <>
    {pageData.map(item => <Item key={item.id} data={item} />)}
    <button onClick={prevPage}>Prev</button>
    <span>{currentPage} / {totalPages}</span>
    <button onClick={nextPage}>Next</button>
  </>
);
```

### 🎯 Fast Lookups (O(n) → O(1))

```javascript
// Before: O(n)
const user = users.find(u => u.id === userId);

// After: O(1)
const userIndex = new FastIndex(users, 'id');
const user = userIndex.get(userId);
```

### 📜 Virtual Scrolling (>500 items)

```javascript
const { visibleItems, containerRef, totalHeight } = useVirtualScroll({
  items: largeList,
  itemHeight: 60,
  overscan: 3
});

return (
  <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
    <div style={{ height: totalHeight }}>
      {visibleItems.map(({ data, offsetY }) => (
        <div key={data.id} style={{ transform: `translateY(${offsetY}px)` }}>
          <Item data={data} />
        </div>
      ))}
    </div>
  </div>
);
```

### 🌐 API Calls

```javascript
// Single request (cached + retry)
const data = await apiClient.get('/api/examiners');

// Parallel requests
const [data1, data2, data3] = await parallelRequests([
  () => apiClient.get('/api/examiners'),
  () => apiClient.get('/api/subjects'),
  () => apiClient.get('/api/valuations')
], { concurrency: 5 });
```

### 🎨 Redux Selectors

```javascript
// Create memoized selector
const selectExaminerById = createIndexedSelector(
  state => state.examiner.byId,
  'id'
);

// Use in component
const examiner = useSelector(state => selectExaminerById(state, examinerId));
```

### 🔄 Normalized State

```javascript
// Normalize array to { byId: {}, allIds: [] }
const normalized = normalizeData(examiners, 'id');

// Denormalize back to array
const examiners = denormalizeData(normalized.byId, normalized.allIds);
```

### 🎭 HOC Patterns

```javascript
// Performance monitoring
export default withPerformance(MyComponent, 'MyComponent');

// Error boundary
export default withErrorBoundary(MyComponent, {
  onError: (error) => console.error(error)
});

// Compose multiple HOCs
export default compose(
  withPerformance('MyComponent'),
  withErrorBoundary(),
  withCache()
)(MyComponent);
```

### ⏱️ Debounce/Throttle

```javascript
// Debounce (waits for pause)
const debouncedValue = useDebounce(value, 300);

// Throttle (limits frequency)
const throttledValue = useThrottle(value, 500);
```

### 📊 Filtered/Sorted/Grouped Data

```javascript
// Filter
const { filtered, setFilter } = useFilteredData(
  items,
  (item, filter) => item.name.includes(filter)
);

// Sort
const { sorted, sortBy } = useSortedData(items, 'date', 'desc');

// Group
const { grouped } = useGroupedData(items, 'category');
```

---

## Replace These Common Anti-Patterns

### ❌ Direct API Calls
```javascript
// DON'T
const response = await axios.get('/api/data');
```
```javascript
// DO
const response = await apiClient.get('/api/data');
```

### ❌ Array.find in Loops
```javascript
// DON'T
items.forEach(item => {
  const user = users.find(u => u.id === item.userId); // O(n²)!
});
```
```javascript
// DO
const userIndex = new FastIndex(users, 'id');
items.forEach(item => {
  const user = userIndex.get(item.userId); // O(n)
});
```

### ❌ Unnecesary Re-renders
```javascript
// DON'T
<Button onClick={() => handleClick(id)} />  // New function every render
```
```javascript
// DO
const handleClick = useMemoizedCallback((id) => { ... }, []);
<Button onClick={() => handleClick(id)} />
```

### ❌ Filtering on Every Render
```javascript
// DON'T
const filtered = items.filter(item => item.active); // Runs every render
```
```javascript
// DO
const { filtered } = useFilteredData(items, item => item.active); // Memoized
```

---

## Performance Checklist

### Must Do (High Impact)
- [ ] Replace router with lazy-loaded version
- [ ] Add virtual scrolling to lists >100 items
- [ ] Replace Array.find with FastIndex
- [ ] Debounce all search inputs
- [ ] Use apiClient instead of axios

### Should Do (Medium Impact)
- [ ] Normalize Redux state
- [ ] Use memoized selectors
- [ ] Add pagination to tables
- [ ] Batch parallel API requests
- [ ] Wrap with withPerformance

### Nice to Have (Low Impact)  
- [ ] Use Vite optimization config
- [ ] Enable performance monitoring
- [ ] Add error boundaries
- [ ] Optimize images
- [ ] Use React.memo on list items

---

## Quick Wins (30 minutes each)

### 1. Optimize Search
Find all: `<input.*onChange.*search`
Replace with: `useSearch` hook

### 2. Optimize Pagination
Find all: `.slice((page - 1) * size, page * size)`
Replace with: `usePagination` hook

### 3. Optimize Lookups
Find all: `.find(.*=>.*id.*===`
Replace with: `FastIndex`

### 4. Optimize API
Find all: `axios.get|axios.post`
Replace with: `apiClient.get|apiClient.post`

---

## Constants Quick Reference

```javascript
import { 
  API_CONFIG,         // BASE_URL, TIMEOUT, RETRY_ATTEMPTS
  STORAGE_KEYS,       // AUTH_TOKEN, USER_DATA
  ROUTES,             // All route paths
  UI_CONSTANTS,       // DEBOUNCE_DELAY, PAGE_SIZE
  FEATURE_FLAGS,      // ENABLE_CACHE, ENABLE_VIRTUAL_SCROLL
  ERROR_MESSAGES,     // Standard error messages
  SUCCESS_MESSAGES,   // Standard success messages
  HTTP_STATUS         // Status codes
} from '@/constants';
```

---

## DevTools Checklist

### Network Tab
- [ ] Initial bundle <1MB
- [ ] JavaScript chunks load on demand
- [ ] No duplicate requests
- [ ] Cached requests return from cache

### Performance Tab
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] No long tasks >50ms
- [ ] 60fps during scroll

### Console
- [ ] No errors
- [ ] Performance warnings (if monitoring enabled)
- [ ] Cache hit rate logs

### Lighthouse
- [ ] Performance score >90
- [ ] Best Practices >90
- [ ] Accessibility >90

---

## Emergency Rollback

```bash
# Rollback router
cd frontend/src/router
mv index.jsx index.new.jsx
mv index.backup.jsx index.jsx

# Rollback vite config
cd ../..
mv vite.config.js vite.config.new.js
mv vite.config.backup.js vite.config.js

# Restart dev server
npm run dev
```

---

## Help & Documentation

📖 **Full Guides**:
- `OPTIMIZATION_SUMMARY.md` - Overview & file summary
- `FRONTEND_OPTIMIZATION_GUIDE.md` - Usage patterns
- `MIGRATION_CHECKLIST_DETAILED.md` - Step-by-step migration

💡 **Examples**:
- `src/examples/OptimizedComponentExample.jsx` - Before/after code

🔧 **Configuration**:
- `src/constants/index.js` - All constants
- `vite.config.optimized.js` - Build optimization

---

## Common Issues

**Q: Imports not working**
```javascript
// Check vite.config.js has path alias
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@core': path.resolve(__dirname, './src/core')
  }
}
```

**Q: Chunks not loading**
- Check Network tab for 404s
- Verify dynamic import paths
- Clear browser cache

**Q: Cache not working**
- Check `FEATURE_FLAGS.ENABLE_CACHE` is true
- Verify request is GET method
- Check TTL hasn't expired

**Q: Performance warnings**
- Use React DevTools Profiler
- Check component render count
- Look for unnecessary re-renders

---

**Built with ❤️ using Google/Facebook-level patterns**
**Ready to ship 🚀**
