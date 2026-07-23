import { useEffect, useRef, useState } from 'react'
import type { Priority, Task } from '../types'
import { DueDateBadge, startDateEdit } from './DueDateControl'
import { PrioritySelect } from './PrioritySelect'

interface Props {
  tasks: Task[]
  parentId?: string | null
  depth?: number
  onToggle: (task: Task) => void
  onTitleChange: (task: Task, title: string) => void
  onPriorityChange: (task: Task, priority: Priority) => void
  onDueChange: (task: Task, dueAt: string | null) => void
  onRemindChange: (task: Task, enabled: boolean) => void
  onAddSubtask: (parent: Task) => void
  onDelete: (task: Task) => void
  onClearDue: (task: Task) => void
}

function TaskRow({
  task,
  depth,
  onToggle,
  onTitleChange,
  onPriorityChange,
  onDueChange,
  onRemindChange,
  onAddSubtask,
  onDelete,
  onClearDue,
}: {
  task: Task
  depth: number
  onToggle: (task: Task) => void
  onTitleChange: (task: Task, title: string) => void
  onPriorityChange: (task: Task, priority: Priority) => void
  onDueChange: (task: Task, dueAt: string | null) => void
  onRemindChange: (task: Task, enabled: boolean) => void
  onAddSubtask: (parent: Task) => void
  onDelete: (task: Task) => void
  onClearDue: (task: Task) => void
}) {
  const [editingDue, setEditingDue] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    if (expanded) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    } else {
      el.style.height = ''
    }
  }, [expanded, task.title])

  return (
    <div
      className={`task-row${task.completed ? ' completed' : ''}${menuOpen ? ' menu-open' : ''}${expanded ? ' expanded' : ''}`}
      style={{ paddingLeft: 8 + depth * 18 }}
    >
      <input
        className="checkbox"
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
      />
      <textarea
        ref={titleRef}
        className="task-title"
        value={task.title}
        rows={1}
        spellCheck={false}
        onChange={(e) => onTitleChange(task, e.target.value)}
        onFocus={() => setExpanded(true)}
        onClick={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        placeholder="任务内容"
        title={expanded ? undefined : task.title}
      />
      <DueDateBadge
        dueAt={task.dueAt}
        remindEnabled={task.remindEnabled}
        editing={editingDue}
        onEditingChange={setEditingDue}
        onDueChange={(dueAt) => {
          if (dueAt === null) onClearDue(task)
          else onDueChange(task, dueAt)
        }}
        onRemindChange={(enabled) => onRemindChange(task, enabled)}
      />
      <PrioritySelect
        value={task.priority}
        onChange={(priority) => onPriorityChange(task, priority)}
      />
      <div className="task-more" ref={menuRef}>
        <button
          type="button"
          className="more-btn"
          title="更多"
          aria-label="更多操作"
          onClick={() => setMenuOpen((v) => !v)}
        >
          ▾
        </button>
        {menuOpen && (
          <div className="task-more-menu">
            <button
              type="button"
              onClick={() => {
                startDateEdit(
                  task.dueAt,
                  (dueAt) => onDueChange(task, dueAt),
                  setEditingDue,
                )
                setMenuOpen(false)
              }}
            >
              {task.dueAt ? '修改日期' : '添加日期'}
            </button>
            {task.dueAt && (
              <button
                type="button"
                onClick={() => {
                  onClearDue(task)
                  setMenuOpen(false)
                }}
              >
                清除日期
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onAddSubtask(task)
                setMenuOpen(false)
              }}
            >
              添加子任务
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => {
                onDelete(task)
                setMenuOpen(false)
              }}
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function TaskTree({
  tasks,
  parentId = null,
  depth = 0,
  onToggle,
  onTitleChange,
  onPriorityChange,
  onDueChange,
  onRemindChange,
  onAddSubtask,
  onDelete,
  onClearDue,
}: Props) {
  const nodes = tasks.filter((t) => t.parentId === parentId)

  if (nodes.length === 0 && depth === 0) {
    return <div className="empty-inline">暂无任务，在下方输入后回车添加</div>
  }

  return (
    <div className={depth > 0 ? 'subtasks' : 'task-list'}>
      {nodes.map((task) => (
        <div key={task.id}>
          <TaskRow
            task={task}
            depth={depth}
            onToggle={onToggle}
            onTitleChange={onTitleChange}
            onPriorityChange={onPriorityChange}
            onDueChange={onDueChange}
            onRemindChange={onRemindChange}
            onAddSubtask={onAddSubtask}
            onDelete={onDelete}
            onClearDue={onClearDue}
          />
          <TaskTree
            tasks={tasks}
            parentId={task.id}
            depth={depth + 1}
            onToggle={onToggle}
            onTitleChange={onTitleChange}
            onPriorityChange={onPriorityChange}
            onDueChange={onDueChange}
            onRemindChange={onRemindChange}
            onAddSubtask={onAddSubtask}
            onDelete={onDelete}
            onClearDue={onClearDue}
          />
        </div>
      ))}
    </div>
  )
}
