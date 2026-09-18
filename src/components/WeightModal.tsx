import { useEffect, useRef, useState } from 'react'
import { Scale, X } from 'lucide-react'

interface WeightModalProps {
  open: boolean
  currentWeight?: number
  onClose: () => void
  onSave: (weight: number) => void
}

export function WeightModal({ open, currentWeight, onClose, onSave }: WeightModalProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setValue(currentWeight ? currentWeight.toFixed(1).replace('.', ',') : '')
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [open, currentWeight])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const parsed = Number(value.replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed < 40 || parsed > 250) {
      setError('Informe um peso entre 40 e 250 kg.')
      return
    }
    onSave(Math.round(parsed * 10) / 10)
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="weight-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
        <span className="modal-icon"><Scale size={22} /></span>
        <p className="eyebrow">CHECKPOINT CORPORAL</p>
        <h2 id="weight-title">Registrar peso</h2>
        <p className="modal-help">Faça o registro durante a caminhada, quando passar pela farmácia.</p>
        <form onSubmit={submit}>
          <label className="weight-input">
            <span className="sr-only">Peso em quilogramas</span>
            <input
              ref={inputRef}
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="99,4"
            />
            <span>kg</span>
          </label>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit">SALVAR REGISTRO</button>
        </form>
      </section>
    </div>
  )
}
