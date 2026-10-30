import { describe, expect, it } from 'vitest'
import { META_DIARIA_MIN, progressoDaMeta } from './meta'

describe('progressoDaMeta', () => {
  it('calcula o percentual proporcional ao total do dia', () => {
    const r = progressoDaMeta(60 * 60) // 1h de 4h
    expect(r.metaSeg).toBe(META_DIARIA_MIN * 60)
    expect(r.percentual).toBe(25)
  })

  it('nunca passa de 100%, mesmo com totalSeg muito maior que a meta', () => {
    const r = progressoDaMeta(999 * 60)
    expect(r.percentual).toBe(100)
  })

  it('arredonda para baixo', () => {
    // 100min de 240min = 41.66% -> 41
    const r = progressoDaMeta(100 * 60)
    expect(r.percentual).toBe(41)
  })

  it('zero de total dá zero por cento', () => {
    expect(progressoDaMeta(0).percentual).toBe(0)
  })
})
