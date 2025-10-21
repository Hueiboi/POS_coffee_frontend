'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function useConfirm() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => {})

  const confirm = (msg: string) => {
    setMessage(msg)
    setOpen(true)
    return new Promise<boolean>((resolve) => setResolver(() => resolve))
  }

  const handleConfirm = () => {
    setOpen(false)
    resolver(true)
  }

  const handleCancel = () => {
    setOpen(false)
    resolver(false)
  }

  const ConfirmDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{message}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return { confirm, ConfirmDialog }
}
