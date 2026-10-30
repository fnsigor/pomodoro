export const META_DIARIA_MIN = 240

export function progressoDaMeta(totalSeg: number): {
  totalSeg: number
  metaSeg: number
  percentual: number
} {
  const metaSeg = META_DIARIA_MIN * 60
  const percentual = Math.min(100, Math.floor((totalSeg / metaSeg) * 100))
  return { totalSeg, metaSeg, percentual }
}
