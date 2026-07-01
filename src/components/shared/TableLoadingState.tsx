interface TableLoadingStateProps {
  title: string
  detail: string
}

export function TableLoadingState({ title, detail }: TableLoadingStateProps) {
  return (
    <div className="table-loading-state">
      <span className="table-loading-spinner" aria-hidden="true" />
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  )
}
