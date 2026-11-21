import { afterEach, describe, expect, it } from 'vitest'
import {
  closedShelvesStorageKey,
  persistClosedRootIds,
  readClosedRootIds,
} from './shelf-state'

describe('shelf-state', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('returns an empty set when there is no saved state', () => {
    expect(readClosedRootIds('user-1')).toEqual(new Set())
  })

  it('persists and restores closed root ids', () => {
    persistClosedRootIds('user-1', new Set(['root-1', 'root-2']))

    expect(readClosedRootIds('user-1')).toEqual(
      new Set(['root-1', 'root-2']),
    )
  })

  it('ignores invalid stored values', () => {
    sessionStorage.setItem(closedShelvesStorageKey('user-1'), '{"bad":true}')

    expect(readClosedRootIds('user-1')).toEqual(new Set())
  })
})
