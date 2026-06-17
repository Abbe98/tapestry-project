import { memo, useMemo, useState } from 'react'
import { Tooltip } from 'tapestry-core-client/src/components/lib/tooltip'
import { WebpageItemDto } from 'tapestry-shared/src/data-transfer/resources/dtos/item'
import styles from './favicon-view.module.css'

export interface FaviconViewProps {
  item: WebpageItemDto
}

function originFaviconUrl(source: string) {
  try {
    return new URL('/favicon.ico', source).toString()
  } catch {
    return null
  }
}

function siteHost(source: string) {
  try {
    return new URL(source).host
  } catch {
    return source
  }
}

export const FaviconView = memo(({ item }: FaviconViewProps) => {
  const { source, title } = item
  const faviconUrl = useMemo(() => originFaviconUrl(source), [source])
  const [imageFailed, setImageFailed] = useState(false)

  const tooltipText = title?.trim() || siteHost(source)

  return (
    <a
      className={styles.faviconLink}
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tooltipText}
    >
      {faviconUrl && !imageFailed ? (
        <img
          className={styles.favicon}
          src={faviconUrl}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={`material-symbols-outlined ${styles.fallback}`}>public</span>
      )}
      <Tooltip side="bottom" offset={8}>
        {tooltipText}
      </Tooltip>
    </a>
  )
})
