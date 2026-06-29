import { useNavigate } from 'react-router-dom'

interface SimpleModulePageProps {
  title: string
  description: string
  cards: Array<{
    title: string
    body: string
    meta: string
    route?: string
  }>
}

export function SimpleModulePage({ title, description, cards }: SimpleModulePageProps) {
  const navigate = useNavigate()

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
            <div className="module-card-footer">
              <span>{card.meta}</span>
              {card.route && (
                <button className="module-card-action" type="button" onClick={() => navigate(card.route!)}>
                  Abrir
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
