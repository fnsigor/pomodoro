// Único arquivo do core que importa `dayjs` diretamente. Todo o resto do pacote
// deve importar o `dayjs` reexportado por este módulo (`import { dayjs } from './data'`),
// nunca `new Date()`, `Date.now()` ou aritmética manual de ms.
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import calendar from 'dayjs/plugin/calendar'
import duration from 'dayjs/plugin/duration'
import isBetween from 'dayjs/plugin/isBetween'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(duration)
dayjs.extend(isoWeek)
dayjs.extend(isBetween)
dayjs.extend(calendar)
dayjs.locale('pt-br')

export { dayjs }
