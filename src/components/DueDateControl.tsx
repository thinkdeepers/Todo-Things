import { useEffect, useRef, useState } from 'react'

interface Props {
  dueAt: string | null
  remindEnabled: boolean
  editing: boolean
  onEditingChange: (editing: boolean) => void
  onDueChange: (dueAt: string | null) => void
  onRemindChange: (enabled: boolean) => void
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInputValue(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function formatShort(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 有日期时显示在优先级前面 */
export function DueDateBadge({
  dueAt,
  remindEnabled,
  editing,
  onEditingChange,
  onDueChange,
  onRemindChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        inputRef.current?.showPicker?.()
        inputRef.current?.focus()
      })
    }
  }, [editing])

  if (!dueAt && !editing) return null

  return (
    <div className="due-display">
      {editing ? (
        <input
          ref={inputRef}
          type="datetime-local"
          value={toLocalInputValue(dueAt)}
          onChange={(e) => {
            const next = fromLocalInputValue(e.target.value)
            onDueChange(next)
            if (!next) {
              onRemindChange(false)
              onEditingChange(false)
            }
          }}
          onBlur={() => onEditingChange(false)}
          title="任务日期"
        />
      ) : (
        <button
          type="button"
          className="due-chip"
          title="编辑日期"
          onClick={() => onEditingChange(true)}
        >
          {formatShort(dueAt!)}
        </button>
      )}
      {dueAt && !editing && (
        <label className="remind-mini" title="提醒">
          <input
            type="checkbox"
            checked={remindEnabled}
            onChange={(e) => onRemindChange(e.target.checked)}
          />
        </label>
      )}
    </div>
  )
}

export function startDateEdit(
  dueAt: string | null,
  onDueChange: (dueAt: string | null) => void,
  onEditingChange: (editing: boolean) => void,
) {
  if (!dueAt) {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    d.setHours(d.getHours() + 1)
    onDueChange(d.toISOString())
  }
  onEditingChange(true)
}
