import type { Priority } from '../types'
import { PRIORITY_META } from '../types'

interface Props {
  value: Priority
  onChange: (value: Priority) => void
}

export function PrioritySelect({ value, onChange }: Props) {
  const meta = PRIORITY_META[value]
  return (
    <select
      className="priority-select"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as Priority)}
      style={{ color: meta.color, background: meta.bg }}
      title="优先级"
    >
      {([1, 2, 3, 4] as Priority[]).map((p) => (
        <option key={p} value={p}>
          {PRIORITY_META[p].label}
        </option>
      ))}
    </select>
  )
}
