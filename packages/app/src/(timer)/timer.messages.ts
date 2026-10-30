export const TIMER_MENSAGENS = {
  sessaoConcluida: 'Sessão concluída! Excelente trabalho.',
  reiniciado: 'Temporizador reiniciado',
  fasePulada: 'Fase pulada',
  // Caso sem texto explícito no CLAUDE.md: fimDeFase sem registrarSessao só
  // acontece quando uma pausa termina naturalmente (só o Pomodoro tem pausa).
  pausaEncerrada: 'Pausa encerrada — hora de focar!',
  presetPersonalizadoCriado: 'Modo personalizado criado',
  presetPersonalizadoInvalido: 'Informe um valor entre 1 e 240 minutos',
  atividadeTrocada: (nome: string) => `Atividade alterada para ${nome}`,
} as const

export const TIMER_ROTULO_BOTAO = {
  iniciarFoco: 'Iniciar Foco',
  pausarFoco: 'Pausar Foco',
  continuar: 'Continuar',
  iniciarPausa: 'Iniciar Pausa',
} as const

export const TIMER_ATALHOS = [
  { tecla: 'Space', descricao: 'Iniciar ou pausar' },
  { tecla: 'R', descricao: 'Reiniciar' },
  { tecla: 'S', descricao: 'Pular fase' },
  { tecla: '← →', descricao: 'Trocar modo' },
] as const
