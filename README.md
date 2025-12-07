# PeopleFusion Organizational Chart

An interactive organizational chart application built with Next.js, React, TypeScript, and Redux Toolkit. This application displays employee hierarchies with support for multiple view types (People, Position, Organization) and provides features like search, zoom, expand/collapse, and detailed employee information.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Token Usage](#token-usage)
- [How to Run](#how-to-run)
- [How to Test](#how-to-test)
- [Assumptions & Limitations](#assumptions--limitations)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)

## Setup Instructions

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (or yarn/pnpm)
- **Git**: For cloning the repository

### Installation Steps

1. **Clone the repository** (if applicable):

   ```bash
   git clone <repository-url>
   cd peoplefusion-org-chart
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup** (Optional):

   - The application uses a hardcoded authentication token for development
   - For production, create a `.env.local` file:
     ```env
     NEXT_PUBLIC_API_BASE_URL=https://worksync.global/api
     NEXT_PUBLIC_AUTH_TOKEN=your_token_here
     ```

4. **Verify installation**:
   ```bash
   npm run build
   ```

## Token Usage

### Authentication Token

The application uses a **non-expiring Bearer token** for authentication. The token is currently hardcoded in `src/services/api.ts` for development purposes.

**Token Location**: `src/services/api.ts` (line 17-18)

**How it works**:

- The token is automatically attached to all API requests via Axios request interceptor
- Format: `Authorization: Bearer <token>`
- The token is included in the `Authorization` header for every API call

**Security Note**:

- ⚠️ **For Production**: Move the token to environment variables (`.env.local`)
- ⚠️ **Never commit** tokens to version control
- The current implementation is for **development only**

### Token Configuration

The token is configured in the Axios request interceptor:

```typescript
// src/services/api.ts
apiClient.interceptors.request.use((config) => {
  if (AUTH_TOKEN && config.headers) {
    config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  return config;
});
```

## How to Run

### Development Mode

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open your browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The application will automatically reload on file changes

### Production Build

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start the production server**:

   ```bash
   npm start
   ```

3. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run test:api` - Test API endpoints (if test script exists)

## How to Test

### Manual Testing

#### 1. **Test Employee IDs**

The application supports the following test employee IDs:

- `18`
- `21` (default - loads on initial page load)
- `22`
- `23`
- `25`
- `29`
- `30`

**To test different employees**:

- Modify `defaultEmployeeId` in `src/app/page.tsx` (line ~35)
- Or implement a UI control to change the employee ID

#### 2. **Test API Endpoint**

You can test the API directly using the test script:

```bash
npm run test:api
```

Or manually test in Postman/Thunder Client:

```http
GET https://worksync.global/api/relationship/people_chart/21
Authorization: Bearer <token>
```

#### 3. **Test Features**

**Chart Views**:

- ✅ Click on "People", "Position", "Organization" tabs
- ✅ Verify data transforms correctly for each view
- ✅ Check that lines and connections render properly

**Search Functionality**:

- ✅ Type employee names in the search bar
- ✅ Verify search results highlight correctly
- ✅ Check auto-scroll to search results

**Zoom & Pan**:

- ✅ Use `+` and `-` buttons to zoom (50% - 200%)
- ✅ Verify chart scales correctly
- ✅ Check that content doesn't get cut off

**Expand/Collapse**:

- ✅ Click expand/collapse buttons on nodes
- ✅ Verify children appear/disappear with animation
- ✅ Check "Contains X" button when collapsed

**Employee Details**:

- ✅ Click on any employee card
- ✅ Verify sidebar opens with employee details
- ✅ Check profile picture, name, title, email, reports

**Responsive Design**:

- ✅ Test on mobile (375px width)
- ✅ Test on tablet (768px width)
- ✅ Test on desktop (1024px+ width)
- ✅ Verify horizontal lines adjust correctly for 2 vs 3+ children

#### 4. **Test Error Handling**

**Network Errors**:

- Disable network connection
- Verify error toast appears
- Test retry functionality

**API Errors**:

- Test with invalid employee ID (e.g., 999)
- Verify 404 error handling
- Check error messages are user-friendly

### Automated Testing

Currently, the project does not include automated test suites. To add testing:

1. **Install testing dependencies**:

   ```bash
   npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
   ```

2. **Create test files**:
   - Component tests: `*.test.tsx`
   - API tests: `*.test.ts`

## Assumptions & Limitations

### Assumptions

1. **API Response Structure**:

   - API returns data in format: `{ status: "OK", tree: { ... } }`
   - Employee data includes: `target` (name), `pic` (profile image), `direct_reports`, `indirect_reports`, `relationship_id` (position)
   - Profile images are hosted on the storage bucket and URLs are provided in the API response

2. **Data Completeness**:

   - Some employees may have missing fields (null values)
   - Profile pictures may be missing or broken
   - Not all employees have managers or direct reports
   - Department information may not be available for all employees

3. **User Experience**:

   - Users understand organizational chart navigation
   - Users have JavaScript enabled
   - Users are using modern browsers (Chrome, Firefox, Safari, Edge)

4. **Authentication**:
   - Token is non-expiring (for development)
   - Token provides access to all employee data
   - No role-based access control implemented

### Limitations

1. **Data Limitations**:

   - ⚠️ **Missing Profile Pictures**: Some employees may not have profile images
     - **Solution**: Fallback to initials avatar is implemented
   - ⚠️ **Missing Department Data**: Not all employees have department information
     - **Solution**: Shows "Unknown Department" or "General" as fallback
   - ⚠️ **Incomplete Relationships**: Some nodes may have broken or missing parent-child relationships
     - **Solution**: Graceful handling with empty state messages

2. **Performance Limitations**:

   - Large organizational charts (1000+ nodes) may have performance issues
   - No pagination or lazy loading for very deep hierarchies
   - All data is loaded at once (no incremental loading)

3. **Browser Compatibility**:

   - Requires modern browsers with ES6+ support
   - CSS Grid and Flexbox required
   - SVG support needed for icons

4. **Responsive Design**:

   - Horizontal line width calculations are optimized for 2-5 children per node
   - Very wide hierarchies (10+ children) may have layout issues
   - Mobile view may require horizontal scrolling for wide charts

5. **Feature Limitations**:

   - No export functionality (PDF/PNG export not implemented)
   - No drag-and-drop node repositioning
   - No bulk operations (select multiple employees)
   - Search is client-side only (no server-side search)
   - No undo/redo for expand/collapse actions

6. **API Limitations**:

   - Single endpoint for all employee data
   - No filtering or pagination on API side
   - No real-time updates (data is static after initial load)
   - Rate limiting not handled (assumes no rate limits)

7. **Accessibility**:

   - Keyboard navigation implemented but may have edge cases
   - Screen reader support is basic
   - Focus management could be improved for complex interactions

8. **State Management**:
   - No persistence of user preferences (expand/collapse state, zoom level)
   - State resets on page refresh
   - No URL-based navigation to specific employees

### Known Issues

1. **Horizontal Line Width**:

   - Line width calculation uses fixed multipliers for 2 vs 3+ children
   - May need adjustment based on actual card widths and gaps
   - Different breakpoints (mobile/tablet/desktop) use different calculations

2. **Zoom Functionality**:

   - Zoom is applied via CSS transform, which may cause layout issues at extreme zoom levels
   - Content may overflow container at high zoom levels

3. **Search Highlighting**:
   - Only highlights first search result
   - No navigation between multiple search results

## Project Structure

```
peoplefusion-org-chart/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Redux provider
│   │   ├── page.tsx             # Main org chart page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── org-chart/
│   │   │   ├── Header.tsx       # Top header with breadcrumbs
│   │   │   ├── OrgChartTabs.tsx # Tab navigation (People/Position/Organization)
│   │   │   ├── ChartSearchBar.tsx # Search functionality
│   │   │   ├── ChartContainer.tsx  # Chart wrapper with loading/error states
│   │   │   ├── OrgChartContainer.tsx # Main chart rendering logic
│   │   │   ├── OrgChartNode.tsx     # Employee card component
│   │   │   ├── PositionNode.tsx     # Position view card component
│   │   │   ├── OrganizationNode.tsx  # Organization view card component
│   │   │   ├── ChartControls.tsx    # Zoom and view controls
│   │   │   └── Sidebar.tsx          # Employee details sidebar
│   │   └── common/
│   │       ├── Avatar.tsx           # Profile picture component
│   │       ├── Toast.tsx            # Toast notification component
│   │       └── SkeletonLoader.tsx    # Loading skeleton
│   ├── store/
│   │   ├── store.ts                 # Redux store configuration
│   │   ├── slices/
│   │   │   └── orgChartSlice.ts     # Redux slice with state and actions
│   │   ├── hooks.ts                 # Typed Redux hooks
│   │   └── StoreProvider.tsx        # Redux provider component
│   ├── services/
│   │   ├── api.ts                   # Axios client configuration
│   │   └── orgChart.service.ts     # API service for org chart data
│   └── hooks/
│       ├── useToast.ts              # Toast notification hook
│       ├── useFocusTrap.ts          # Focus trapping for accessibility
│       └── useKeyboardNavigation.ts # Keyboard navigation hook
├── public/
│   └── icons/
│       └── profile-card.svg         # Profile card icon
├── package.json
├── tsconfig.json
└── README.md
```

## Features

### Core Features

- ✅ **Multiple View Types**: People, Position, Organization views
- ✅ **Interactive Chart**: Expand/collapse nodes, zoom, pan
- ✅ **Search Functionality**: Search by name, title, with highlighting
- ✅ **Employee Details**: Sidebar with full employee information
- ✅ **Responsive Design**: Mobile, tablet, and desktop support
- ✅ **Error Handling**: Toast notifications with retry functionality
- ✅ **Loading States**: Skeleton loaders during data fetch
- ✅ **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

### UI Features

- ✅ **Custom Styling**: Matches Figma design specifications
- ✅ **Profile Pictures**: With fallback to initials
- ✅ **Connection Lines**: Horizontal and vertical lines with arrows
- ✅ **Hover States**: Interactive feedback on cards
- ✅ **Selected State**: Visual indication of selected employee
- ✅ **Search Highlighting**: Yellow highlight for search results

## Technology Stack

- **Framework**: Next.js 16.0.7
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5.x
- **State Management**: Redux Toolkit 2.11.0
- **Styling**: Tailwind CSS 4.1.17
- **HTTP Client**: Axios 1.13.2
- **Build Tool**: Next.js (Turbopack)

## API Documentation

### Primary Endpoint

**GET** `https://worksync.global/api/relationship/people_chart/{employee_id}`

**Path Parameters**:

- `employee_id` (integer, required): The unique identifier of the employee

**Response Format**:

```json
{
  "status": "OK",
  "tree": {
    "employee_id": 21,
    "target": "Employee Name",
    "pic": "https://...",
    "direct_reports": 5,
    "indirect_reports": 10,
    "relationship_id": "Manager",
    "children": [...]
  }
}
```

**Test Employee IDs**: 18, 21, 22, 23, 25, 29, 30

## Troubleshooting

### Common Issues

1. **Build Errors**:

   - Run `npm install` to ensure all dependencies are installed
   - Clear `.next` folder: `rm -rf .next` then rebuild

2. **API Errors**:

   - Verify token is valid in `src/services/api.ts`
   - Check network connection
   - Verify API endpoint is accessible

3. **Layout Issues**:

   - Clear browser cache
   - Check browser console for errors
   - Verify Tailwind CSS is properly configured

4. **TypeScript Errors**:
   - Run `npm run build` to see all type errors
   - Ensure all imports are correct

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
