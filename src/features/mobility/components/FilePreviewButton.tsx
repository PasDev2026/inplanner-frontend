import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getTransferFileUrl } from '../actions/mobility.api'
import type { TransferFile } from '../lib/types'

export default function FilePreviewButton({
  requestId,
  file,
  mode = 'preview',
  onPreview,
}: {
  requestId: string
  file: TransferFile
  mode?: 'preview' | 'download'
  onPreview?: (file: TransferFile) => void
}) {
  const [loading, setLoading] = useState(false)

  const openFile = async () => {
    const win = window.open('', '_blank')
    setLoading(true)
    try {
      const result = await getTransferFileUrl(
        requestId,
        file.id_file,
        mode,
      )
      if (win) {
        win.location.href = result.url
      } else {
        toast.error('El navegador bloqueó la ventana emergente')
      }
    } catch (error) {
      win?.close()
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const Icon = mode === 'download' ? Download : Eye

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        if (onPreview) {
          onPreview(file)
          return
        }
        void openFile()
      }}
      disabled={loading}
    >
      <Icon className="mr-1 h-3.5 w-3.5" />
      {loading
        ? 'Abriendo...'
        : mode === 'download'
          ? 'Descargar'
          : 'Ver'}
    </Button>
  )
}
