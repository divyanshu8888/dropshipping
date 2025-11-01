# Admin Components

This folder contains all admin-specific components for the control room dashboard.

## Structure

```
admin/
├── ui/                    # UI Components
│   ├── DataGrid.tsx       # Data table with bulk actions
│   ├── EditableCard.tsx   # Inline-editable KPI cards
│   ├── KanbanPipeline.tsx # Drag-drop project pipeline
│   └── index.ts
├── forms/                 # Form Components
│   ├── EntityDrawer.tsx   # Right-side entity editor
│   ├── CommandBar.tsx     # Global search & actions (Ctrl+K)
│   └── index.ts
├── data/                  # Data Components
│   ├── EventStream.tsx    # Real-time event feed
│   └── index.ts
├── index.ts              # Main export file
└── README.md             # This file
```

## Usage

```typescript
// Import all admin components (from pages/)
import { 
  EntityDrawer, 
  CommandBar, 
  DataGrid, 
  EditableCard, 
  KanbanPipeline, 
  EventStream 
} from '../../src/components/admin'

// Or import specific categories
import { DataGrid, EditableCard } from '../../src/components/admin/ui'
import { EntityDrawer, CommandBar } from '../../src/components/admin/forms'
import { EventStream } from '../../src/components/admin/data'

// From within src/ folder:
import { DataGrid } from '../components/admin/ui'
import { EntityDrawer } from '../components/admin/forms'
```

## Components Overview

### UI Components
- **DataGrid**: Actionable tables with bulk operations, filters, and row actions
- **EditableCard**: Inline-editable KPI cards with fast-path menus
- **KanbanPipeline**: Drag-drop project management with status columns

### Form Components
- **EntityDrawer**: Right-side drawer for entity editing (Summary, Edit, History, Notes)
- **CommandBar**: Global search and quick actions (Ctrl+K command palette)

### Data Components
- **EventStream**: Real-time event feed with pause/auto-scroll and filtering

## Features

- **In-place Editing**: Edit KPIs and entities without page refreshes
- **Bulk Operations**: Select multiple items and perform batch actions
- **Real-time Updates**: Live event streaming with optimistic UI
- **Keyboard Shortcuts**: Power user friendly (Ctrl+K, Enter, Escape)
- **Audit Logging**: Complete action tracking for compliance
- **Role-based Access**: Admin-only operations with security
