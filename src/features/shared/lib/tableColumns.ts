export const TABLE_GRID = '40px minmax(0, 1fr) 120px 110px 150px 100px 160px 120px 40px'

export const TABLE_COLUMNS = ['chevron', 'project', 'empresa', 'status', 'responsible', 'priority', 'date', 'progress', 'actions'] as const

export type TableColumn = typeof TABLE_COLUMNS[number]

export const COL_GROUP = [
  { width: '40px' },
  { width: '1fr' },
  { width: '120px' },
  { width: '110px' },
  { width: '150px' },
  { width: '100px' },
  { width: '160px' },
  { width: '120px' },
  { width: '40px' },
] as const
