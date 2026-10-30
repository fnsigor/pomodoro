import { z } from 'zod'
import { MINUTOS_PERSONALIZADO } from '@focusflow/core'

export const SchemaPresetPersonalizado = z.object({
  minutos: z.coerce
    .number()
    .int()
    .min(MINUTOS_PERSONALIZADO.min)
    .max(MINUTOS_PERSONALIZADO.max),
})

export type SchemaPresetPersonalizadoType = z.infer<typeof SchemaPresetPersonalizado>
