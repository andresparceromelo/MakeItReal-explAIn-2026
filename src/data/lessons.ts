import { CareerStage, LessonConfig, LessonId, TargetRole } from '@/types';

export const CAREER_STAGES: CareerStage[] = [
  '18-24 Primer empleo',
  '25-39 Cambio de área',
  '40+ Reinserción laboral',
];

export const TARGET_ROLES: TargetRole[] = [
  'Atención al cliente',
  'Ventas y comercio',
  'Auxiliar administrativo',
  'Logística y bodega',
  'Tecnología y soporte',
  'Otro',
];

export const LESSONS: Record<LessonId, LessonConfig> = {
  'leccion-1': {
    id: 'leccion-1',
    number: 1,
    accentColor: 'emerald',
    title: '"Cuéntame sobre ti" en 60 segundos',
    shortSubtitle:
      'Presenta tu perfil con claridad en el primer minuto sin bloquearte ni contar toda tu vida.',
    competence:
      'Estructurar una presentación profesional usando Quién soy → Un logro concreto → Por qué encajo en este puesto.',
    estimatedMinutes: '10–15 min',
    formulaName: 'Fórmula Q-L-E (Quién soy → Logro → Encaje)',
    video: {
      src: '/videos/cuentame-sobre-ti-60s.mp4',
      title: 'Cómo responder "Cuéntame sobre ti" en 60 segundos',
      subtitle:
        'Mira este video corto después de tu punto de partida para entender la idea clave antes de practicar.',
      durationLabel: 'Video guía',
    },
    formulaParts: [
      {
        id: 'part1',
        title: 'Quién soy',
        subtitle:
          'Tu perfil actual, formación o área principal en 1 o 2 frases (sin recitar tu biografía personal).',
        tip: 'Empieza por tu rol o fortaleza laboral, no por tu edad ni tu estado civil.',
      },
      {
        id: 'part2',
        title: 'Un logro concreto',
        subtitle:
          'Un ejemplo real de algo que hiciste bien (en un trabajo, negocio familiar, estudio o proyecto).',
        tip: 'Menciona un resultado o acción medible, aunque sea pequeño.',
      },
      {
        id: 'part3',
        title: 'Por qué encajo en este puesto',
        subtitle:
          'Conecta lo que sabes hacer con lo que necesita la empresa hoy.',
        tip: 'Cierra diciendo qué valor puntual le aportarías al equipo.',
      },
    ],
    weakExample: {
      text: 'Bueno, yo soy Mateo, tengo 22 años, vivo en Bello con mi familia. Me considero una persona muy responsable, honesta y con muchas ganas de trabajar en lo que salga.',
      whyWeak:
        'Da datos personales irrelevantes, usa adjetivos genéricos sin pruebas y no explica por qué sirve para el puesto.',
    },
    strongExample: {
      text: 'Soy técnico en gestión administrativa y durante el último año apoyé el control de pedidos y facturación en el negocio de mi tía. Logré organizar el inventario en Excel y reducir los errores de despacho casi a cero. Por eso me interesa este puesto de auxiliar: puedo aportar orden desde el primer día y adaptarme rápido a sus procesos.',
      breakdown: [
        'Quién soy: Técnico en gestión administrativa con experiencia práctica en pedidos.',
        'Logro concreto: Organizó inventario en Excel y redujo errores de despacho.',
        'Por qué encajo: Conecta su orden y rapidez con el puesto de auxiliar.',
      ],
    },
    drills: [
      {
        id: 'l1-d1',
        candidateResponse:
          'Soy estudiante de últimos semestres de sistemas y el año pasado creé una hoja de cálculo automatizada que ahorró 4 horas semanales de reportes en una microempresa local.',
        missingPart: 'part3',
        explanation:
          'Tiene perfil claro y un logro concreto excelente, pero olvidó cerrar conectando eso con el puesto al que está aplicando.',
      },
      {
        id: 'l1-d2',
        candidateResponse:
          'Tengo experiencia en atención al cliente en tiendas de barrio y me gustaría trabajar aquí porque sé que valoran el buen trato y puedo ayudarles a fidelizar clientes.',
        missingPart: 'part2',
        explanation:
          'Dice quién es y por qué encaja, pero falta un logro concreto o ejemplo verificable que demuestre ese buen trato.',
      },
      {
        id: 'l1-d3',
        candidateResponse:
          'El semestre pasado coordiné las entregas de un emprendimiento de repostería sin ningún retraso en temporada navideña, y quiero traer esa misma puntualidad a su equipo de logística.',
        missingPart: 'part1',
        explanation:
          'Incluye un gran logro y lo conecta con el puesto, pero arranca sin presentar brevemente quién es o cuál es su perfil actual.',
      },
    ],
    diagnosticQuestionTemplate:
      'Estás en una entrevista para {role}. El entrevistador te sonríe y te dice: "Para empezar, cuéntame un poco sobre ti". ¿Qué responderías hoy?',
    practiceQuestionTemplate:
      'Imagina que llegas a la entrevista para {role} y te piden presentarte en menos de un minuto: "Cuéntame sobre ti". Aplica la fórmula de 3 partes.',
    finalQuestionTemplate:
      'Un reclutador te llama por teléfono para una vacante de {role} y te dice: "Tengo dos minutos antes de mi siguiente reunión, resúmeme tu perfil y por qué deberíamos considerarte". Responde sin ayudas:',
  },
  'leccion-2': {
    id: 'leccion-2',
    number: 2,
    accentColor: 'coral',
    title: 'Responder cuando "no tienes experiencia"',
    shortSubtitle:
      'Convierte proyectos de estudio, trabajos informales o logros propios en evidencia real ante preguntas difíciles.',
    competence:
      'Responder objeciones sobre falta de experiencia formal usando Contexto honesto → Habilidad transferible → Prueba concreta.',
    estimatedMinutes: '10–15 min',
    formulaName:
      'Fórmula C-H-P (Contexto honesto → Habilidad transferible → Prueba concreta)',
    formulaParts: [
      {
        id: 'part1',
        title: 'Contexto honesto',
        subtitle:
          'Reconoce con seguridad y sin disculparte que es tu primer empleo formal en ese cargo (sin inventar experiencia).',
        tip: 'Evita frases como "perdón, no sé nada". Habla con serenidad.',
      },
      {
        id: 'part2',
        title: 'Habilidad transferible',
        subtitle:
          'Nombra la capacidad práctica que SÍ tienes y que aplica directo al cargo (trato al público, organización, manejo de herramientas, resolución de problemas).',
        tip: 'Piensa qué hace esa persona todos los días en el puesto.',
      },
      {
        id: 'part3',
        title: 'Prueba concreta',
        subtitle:
          'Demuestra esa habilidad con un hecho real de tu vida (negocio familiar, voluntariado, estudio, ventas propias o deportes).',
        tip: 'Un ejemplo pequeño y real vale más que diez promesas.',
      },
    ],
    weakExample: {
      text: 'La verdad no tengo experiencia porque nadie me da la oportunidad, pero si me contratan yo aprendo rapidísimo y le pongo toda la actitud.',
      whyWeak:
        'Suena defensiva, no identifica ninguna habilidad útil para el cargo y solo ofrece una promesa sin evidencia.',
    },
    strongExample: {
      text: 'Aunque todavía no he tenido un contrato formal en ventas, tengo mucha facilidad para escuchar necesidades y explicar productos con claridad. Durante seis meses vendí accesorios por WhatsApp e Instagram para un emprendimiento propio, respondiendo dudas y cerrando más de 40 pedidos sin devoluciones.',
      breakdown: [
        'Contexto honesto: Reconoce sin pena que no ha tenido contrato formal en ventas.',
        'Habilidad transferible: Escucha activa y claridad al explicar productos.',
        'Prueba concreta: Más de 40 pedidos cerrados por WhatsApp e Instagram sin devoluciones.',
      ],
    },
    drills: [
      {
        id: 'l2-d1',
        candidateResponse:
          'No he trabajado antes en una oficina formal, pero soy muy organizado, manejo bien Google Drive y Excel, y me adapto rápido a sistemas nuevos.',
        missingPart: 'part3',
        explanation:
          'Es honesto y nombra habilidades útiles, pero no da una prueba concreta de dónde las aplicó realmente.',
      },
      {
        id: 'l2-d2',
        candidateResponse:
          'Sé manejar conflictos con clientes difíciles; cuando ayudaba en la cafetería de mi mamá los fines de semana, logré calmar a varios clientes molestos por demoras y volvieron la semana siguiente.',
        missingPart: 'part1',
        explanation:
          'Tiene una gran habilidad y prueba real, pero omitió responder frontalmente y con naturalidad a la pregunta sobre su falta de experiencia formal.',
      },
      {
        id: 'l2-d3',
        candidateResponse:
          'Es cierto que sería mi primer empleo formal en bodega. El año pasado ayudé a mis vecinos a organizar la mudanza de todo un local comercial y no se perdió ni una sola caja.',
        missingPart: 'part2',
        explanation:
          'Es honesto y da una anécdota real, pero le faltó nombrar explícitamente la habilidad transferible que eso demuestra (por ejemplo: clasificación, control de inventario o trabajo en equipo).',
      },
    ],
    diagnosticQuestionTemplate:
      'En la entrevista para {role}, la persona revisa tu hoja de vida y te pregunta: "Veo que no tienes experiencia formal en este cargo, ¿por qué deberíamos elegirte?". ¿Qué responderías hoy?',
    practiceQuestionTemplate:
      'Te preguntan en la entrevista para {role}: "No tienes experiencia certificada en este puesto, ¿qué te hace pensar que puedes desempeñarlo bien?". Usa la fórmula de 3 partes.',
    finalQuestionTemplate:
      'El entrevistador para {role} te dice: "Los otros candidatos ya han trabajado en empresas similares y tú no. ¿Qué tienes a tu favor?". Responde sin ayudas:',
  },
};

export const LESSON_LIST: LessonConfig[] = [
  LESSONS['leccion-1'],
  LESSONS['leccion-2'],
];

export function formatRoleQuestion(template: string, role: string): string {
  return template.replace('{role}', role);
}
