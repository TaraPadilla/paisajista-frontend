interface SimpleModulePageProps {
  title: string
  description: string
  cards: Array<{
    title: string
    body: string
    meta: string
  }>
}

export function SimpleModulePage({ title, description, cards }: SimpleModulePageProps) {
  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="module-grid">
        {cards.map((card) => (
          <article className="module-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <span>{card.meta}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
