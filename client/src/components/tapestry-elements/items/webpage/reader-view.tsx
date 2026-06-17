import DOMPurify from 'dompurify'
import { memo, useMemo } from 'react'
import { useAsync } from 'tapestry-core-client/src/components/lib/hooks/use-async'
import { Icon } from 'tapestry-core-client/src/components/lib/icon/index'
import { LoadingSpinner } from 'tapestry-core-client/src/components/lib/loading-spinner/index'
import { Text } from 'tapestry-core-client/src/components/lib/text/index'
import { WebpageItemDto } from 'tapestry-shared/src/data-transfer/resources/dtos/item'
import { resource } from '../../../../services/rest-resources'
import styles from './reader-view.module.css'

export interface ReaderViewProps {
  item: WebpageItemDto
}

export const ReaderView = memo(({ item }: ReaderViewProps) => {
  const { source } = item

  const { data, loading, error } = useAsync(
    async ({ signal }) => {
      const response = await resource('proxy').create(
        { type: 'readability', url: source },
        undefined,
        { signal },
      )
      return response.type === 'readability' ? response.result : null
    },
    [source],
  )

  const safeHtml = useMemo(() => {
    if (!data?.content) return ''
    return DOMPurify.sanitize(data.content, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    }).replace(/<a /gi, '<a target="_blank" rel="noopener noreferrer" ')
  }, [data?.content])

  if (loading) {
    return (
      <div className={styles.message}>
        <LoadingSpinner size="32px" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={styles.message}>
        <Icon icon="sentiment_very_dissatisfied" />
        <Text>{`Could not extract readable content from ${source}`}</Text>
      </div>
    )
  }

  return (
    <article className={styles.reader}>
      {data.title && (
        <header className={styles.header}>
          <h1 className={styles.title}>{data.title}</h1>
          {(data.byline || data.siteName) && (
            <div className={styles.meta}>
              {[data.byline, data.siteName].filter(Boolean).join(' • ')}
            </div>
          )}
        </header>
      )}
      <div
        className={styles.content}
        lang={data.lang ?? undefined}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </article>
  )
})
