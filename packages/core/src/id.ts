import { v7 } from 'uuid'
import type { Id } from './dominio'

export const novoId = (): Id => v7()
