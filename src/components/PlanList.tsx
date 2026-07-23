import type { Plan } from '../types'

interface Props {
  plans: Plan[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
}

export function PlanList({ plans, activeId, onSelect, onCreate }: Props) {
  return (
    <>
      <div className="sidebar-actions">
        <button type="button" className="btn" onClick={onCreate} style={{ flex: 1 }}>
          + 新计划
        </button>
      </div>
      <div className="plan-list">
        {plans.length === 0 && (
          <div className="empty" style={{ height: 'auto', padding: '24px 8px' }}>
            <p>还没有计划，先建一个吧</p>
          </div>
        )}
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`plan-item${plan.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(plan.id)}
          >
            <span>{plan.title}</span>
          </button>
        ))}
      </div>
    </>
  )
}
