# Pagination Usage Guide

This library provides cursor-based pagination for API endpoints in Doctor.mx.

## Features

- Cursor-based pagination (not offset-based)
- URL-safe base64 encoded cursors
- Configurable limits with defaults and maximums
- Support for forward and backward pagination
- Pagination metadata in responses

## Quick Start

### 1. Import the pagination utilities

```typescript
import {
  parsePaginationParams,
  buildPaginatedResponse,
  encodeCursor,
  decodeCursor,
} from '@/lib/pagination'
import type { PaginatedResult } from '@/lib/pagination'
```

### 2. Parse pagination parameters from request

```typescript
const { searchParams } = new URL(request.url)
const { cursor, limit, direction } = parsePaginationParams(searchParams)
```

### 3. Apply cursor filtering in your query

```typescript
let query = supabase
  .from('table_name')
  .select('*')

// Apply cursor filtering for forward pagination
if (cursor && direction === 'forward') {
  try {
    const cursorData = decodeCursor(cursor)
    query = query.gt('created_at', cursorData.created_at)
  } catch {
    // Invalid cursor, ignore
  }
}
```

### 4. Build paginated response

```typescript
const result: PaginatedResult<YourType> = buildPaginatedResponse({
  data: items,
  limit,
  getNextCursor: (item) => encodeCursor({ id: item.id, created_at: item.created_at }),
  getPrevCursor: (item) => encodeCursor({ id: item.id, created_at: item.created_at }),
})

return NextResponse.json(result)
```

## API Response Format

All paginated endpoints return the following format:

```json
{
  "data": [...],
  "meta": {
    "next_cursor": "eyJpZCI6IjEyMzQ1NiwidXBkYXRlZF9hdCI6IjIwMjQtMDEtMDFUMDA6MDA6MDBaIn0",
    "prev_cursor": null,
    "has_more": true,
    "has_prev": false,
    "total_count": null,
    "limit": 20
  }
}
```

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cursor` | string \| null | null | Pagination cursor from previous response |
| `limit` | number | 20 | Number of items to return (max: 100) |
| `direction` | 'forward' \| 'backward' | 'forward' | Pagination direction |

## Example Requests

### Get first page
```
GET /api/doctors?limit=20
```

### Get next page
```
GET /api/doctors?cursor=eyJpZCI6IjEyMzQ1NiwidXBkYXRlZF9hdCI6IjIwMjQtMDEtMDFUMDA6MDA6MDBaIn0&limit=20
```

### Get previous page
```
GET /api/doctors?cursor=eyJpZCI6IjEyMzQ1NiwidXBkYXRlZF9hdCI6IjIwMjQtMDEtMDFUMDA6MDA6MDBaIn0&direction=backward&limit=20
```

## Implementation Examples

### GET /api/doctors
- Lists approved doctors with pagination
- Supports filtering by specialty, city, search query
- Supports sorting by rating, price, experience

### GET /api/appointments
- Lists appointments for authenticated patient
- Supports filtering by status
- Sorted by start_ts (newest first)

### GET /api/chat/conversations
- Lists conversations for authenticated user
- Includes unread counts
- Sorted by last_message_at (most recent first)

### GET /api/patients
- Lists patients for authenticated doctor
- Only includes patients with appointments
- Supports search by name
