import { describe, expect, it } from 'vitest'
import {
  fileKind,
  formatBytes,
  getExtension,
  isAllowedExtension,
  isPreviewable,
} from './file-type'

describe('document file-type', () => {
  it('extracts lowercase extensions', () => {
    expect(getExtension('Manual.PDF')).toBe('.pdf')
    expect(getExtension('sin-extension')).toBe('')
  })

  it('allows the supported formats', () => {
    expect(isAllowedExtension('manual.pdf')).toBe(true)
    expect(isAllowedExtension('manual.docx')).toBe(true)
    expect(isAllowedExtension('manual.xlsx')).toBe(true)
    expect(isAllowedExtension('manual.png')).toBe(true)
  })

  it('rejects executables', () => {
    expect(isAllowedExtension('virus.exe')).toBe(false)
    expect(isAllowedExtension('script.bat')).toBe(false)
  })

  it('classifies file kinds', () => {
    expect(fileKind('manual.pdf')).toBe('pdf')
    expect(fileKind('.docx')).toBe('word')
    expect(fileKind('matriz.xlsx')).toBe('excel')
    expect(fileKind('presentacion.pptx')).toBe('powerpoint')
    expect(fileKind('foto.webp')).toBe('image')
    expect(fileKind('nota.txt')).toBe('text')
    expect(fileKind('archivo.bin')).toBe('other')
  })

  it('formats bytes', () => {
    expect(formatBytes(0)).toBe('0 KB')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })

  it('detects previewable MIME types', () => {
    expect(isPreviewable('application/pdf')).toBe(true)
    expect(isPreviewable('image/png')).toBe(true)
    expect(
      isPreviewable(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).toBe(false)
  })
})
