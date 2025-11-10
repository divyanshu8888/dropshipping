import { type ReactNode } from 'react'
import styles from '../styles/freelancers.module.css'

export type FilterControlDescriptor = {
  id: string
  label: string
  shortLabel: string
  icon: ReactNode
  value: string
  defaultValue: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

export type UnitiFilterVariant = 'outline' | 'glass' | 'underline'

interface UnitiFiltersProps {
  variant?: UnitiFilterVariant
  controls: FilterControlDescriptor[]
  onClearAll: () => void
  activeFilters: Array<{ key: string; label: string; onRemove: () => void }>
  filteredCount: number
  totalCount: number
}

const join = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

const variantClasses: Record<UnitiFilterVariant, string> = {
  outline: styles.filterVariantOutline,
  glass: styles.filterVariantGlass,
  underline: styles.filterVariantUnderline,
}

const UnitiFilters = ({
  variant = 'outline',
  controls,
  onClearAll,
  activeFilters,
  filteredCount,
  totalCount,
}: UnitiFiltersProps) => {
  const variantClass = variantClasses[variant]

  return (
    <section className={join(styles.filtersSection, variantClass)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className={styles.filtersHeaderRow}>
          <div className={styles.filtersHeadingGroup}>
            <span className={styles.filtersHeadingOverline}>Filters</span>
            <span className={styles.filtersHeadingSub}>Fine-tune your experts</span>
          </div>
          <button
            onClick={onClearAll}
            className={styles.filtersClearButton}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        </div>

        <div className={styles.filterScroller}>
          {controls.map((control) => (
            <div
              key={control.id}
              className={join(
                styles.filterControl,
                control.value !== control.defaultValue && styles.filterControlActive
              )}
            >
              <div className={styles.filterContent}>
                <div className={styles.filterLabel}>
                  {control.icon && (
                    <span className={styles.filterCoin} aria-hidden="true">
                      <span className={styles.filterCoinAura} />
                      <span className={styles.filterCoinGlyph}>{control.icon}</span>
                    </span>
                  )}
                  <span className={styles.filterLabelFull}>{control.label}</span>
                  <span className={styles.filterLabelShort}>{control.shortLabel}</span>
                </div>
                <div className={styles.filterSelectWrapper}>
                  <select
                    id={control.id}
                    value={control.value}
                    onChange={(e) => control.onChange(e.target.value)}
                    className={styles.filterSelect}
                    aria-label={`Filter by ${control.label.toLowerCase()}`}
                  >
                    {control.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    className={styles.filterCaret}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UnitiFilters
