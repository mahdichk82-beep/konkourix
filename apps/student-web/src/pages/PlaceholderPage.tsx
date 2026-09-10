import { ContentState } from '../components/ui/ContentState'

export function PlaceholderPage({ description, title }: { description: string; title: string }) {
  return (
    <ContentState
      description={description}
      kind="empty"
      title={`${title} هنوز آماده نشده است`}
    />
  )
}
