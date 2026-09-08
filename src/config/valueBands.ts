import type { EstimatedValueBand } from '../lib/database.types'

export const VALUE_BAND_OPTIONS: { value: EstimatedValueBand; label: string }[] = [
  { value: 'under_10k', label: 'Up to R$10k' },
  { value: '10k_50k', label: 'R$10k–50k' },
  { value: '50k_250k', label: 'R$50k–250k' },
  { value: '250k_1m', label: 'R$250k–1M' },
  { value: 'over_1m', label: 'Over R$1M' },
]
