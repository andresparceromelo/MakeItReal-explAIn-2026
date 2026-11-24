# SPEC.md — MakeItReal (hacelo real)

## 1. Project Overview
Build **MakeItReal (hacelo real)**, a clean, mobile-first, Duolingo-style web learning application in **Spanish** that helps job seekers in Antioquia (young first-time job seekers and unemployed adults) learn how to answer key job interview questions with structure and confidence[cite: 1, 2, 3].

### Core Pedagogical & Challenge Constraints (Non-Negotiable)
- **Teach, never do the task for the user:** The AI acts as a coach that evaluates structure, explains errors, and gives hints to retry—it must **NEVER** write or rewrite the full interview answer for the user[cite: 2, 4, 9].
- **Not a generic chatbot:** Every lesson follows a structured 5-step learning loop with a clear, demonstrable competence and an objective "Before vs. After" proof of learning[cite: 3, 7].
- **Real AI only:** Never mock, hardcode, or fake AI evaluations[cite: 9]. If the API fails or `GEMINI_API_KEY` is missing, display a clear error state with a retry button rather than inventing feedback or claiming the user learned[cite: 7, 9].
- **Privacy & zero friction:** No login, no database, no sensitive personal data[cite: 7, 9]. Store optional nickname, career stage, target role, and lesson progress strictly in `localStorage` so the app works immediately in an incognito browser window[cite: 5, 9].
- **Accessibility & clarity:** Plain Colombian Spanish, mobile-first layout (360px+ first), high-contrast text, large tap targets, and minimal visual clutter[cite: 2, 9].

---

## 2. Brand Identity, Design System & Navigation

### Brand Name & Wordmark
- **Full Name (HTML `<title>` & metadata):** `MakeItReal (hacelo real)`
- **Visual Logo Lockup (`BrandLogo.tsx`):** Stacked two-line wordmark aligned left:
  - **Line 1:** `MakeItReal` — Large, heavy/bold weight (`text-xl sm:text-2xl font-extrabold tracking-tight leading-none text-[#10231C]`, optionally highlighting `Real` in `#0E9F6E`).
  - **Line 2:** `hacelo real` — Directly underneath, noticeably smaller and thinner (`text-[11px] sm:text-xs font-light tracking-wide text-[#5B6B65] mt-0.5`).
  - Pair with a small rounded emerald badge icon (`bg-[#0E9F6E]` or `bg-[#F0FAF5]` with a friendly `Sparkles` or `Compass` icon) to give it a modern product feel.

### Color Palette (Strict Tokens — Do Not Substitute Generic Grays/Blues)
Define these exact tokens in `globals.css` (and Tailwind `@theme` / config) and use them consistently across the entire app:

| Rol | Color | HEX | Uso |
| :--- | :--- | :--- | :--- |
| Fondo base | Blanco | `#FFFFFF` | Pantallas, tarjetas y superficies |
| Fondo suave | Menta muy claro | `#F0FAF5` | Secciones alternas, chips y fondos de tarjetas |
| Primario | Verde esmeralda | `#0E9F6E` | Botones, enlaces, íconos activos y navegación |
| Primario oscuro | Verde bosque | `#046C4E` | Estados presionados, encabezados y texto de alto contraste |
| Menta de marca | Verde menta | `#A7F3D0` | Ilustraciones, badges, fondos decorativos y estados de éxito |
| Texto principal | Verde-negro | `#10231C` | Títulos, párrafos y etiquetas |
| Texto secundario | Gris verdoso | `#5B6B65` | Descripciones, metadatos y placeholders |
| Acento cálido | Amarillo suave | `#FBBF24` | Rachas, logros, insignias y llamados positivos |
| Acento coral | Coral suave | `#FB7185` | Categorías, ilustraciones y elementos lúdicos |
| Error | Rojo accesible | `#DC2626` | Alertas y validaciones |
| Borde | Gris verdoso claro | `#DDEAE4` | Separadores y contornos de tarjetas |

```css
:root {
  --bg-base: #FFFFFF;
  --bg-soft: #F0FAF5;
  --primary: #0E9F6E;
  --primary-dark: #046C4E;
  --brand-mint: #A7F3D0;
  --text-main: #10231C;
  --text-muted: #5B6B65;
  --accent-warm: #FBBF24;
  --accent-coral: #FB7185;
  --error: #DC2626;
  --border-soft: #DDEAE4;
}
```

### Typography, Shapes, Shadows & Motion
- **Font:** Load `Plus Jakarta Sans` via `next/font/google` with weights `300`, `400`, `500`, `600`, `700`, `800`. Use `800` (`font-extrabold`) for `MakeItReal` and headings, `300` (`font-light`) for `hacelo real`.
- **Clean, Modern & Rounded:**
  - Base page background is pure white (`#FFFFFF`) with subtle `#F0FAF5` surfaces for alternating sections, pills, and card highlights.
  - Generous border radius: `rounded-2xl` / `rounded-3xl` on cards, `rounded-xl` / `rounded-full` on buttons and chips.
  - Soft, modern layered shadows tinted naturally (e.g., `shadow-[0_8px_30px_rgb(16,35,28,0.06)]` for cards, subtle lift `hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgb(14,159,110,0.12)]` on interactive lesson cards).
  - Primary CTA buttons use `#0E9F6E` with a tactile press transition to `#046C4E` (`bg-[#0E9F6E] hover:bg-[#046C4E] active:scale-[0.98] transition-all duration-200`).
- **Fluid & Low Cognitive Load (Anti-Clutter Rule):**
  - Never overwhelm users with dense text blocks, tiny metadata, or too many simultaneous elements.
  - Stick to **one clear primary action per screen**, generous whitespace (`p-6 sm:p-8`, `gap-6`), and short scannable sentences (max 2–3 lines per block).
  - Smooth, subtle transitions (`transition-all duration-200 ease-out`) between steps, cards, and feedback states.

### Top Navigation Bar (`TopNavbar.tsx`)
- **Position & Surface:** Sticky top bar (`sticky top-0 z-40 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DDEAE4]`), clean height (`h-16 sm:h-18`), max-width container (`max-w-4xl mx-auto px-4 sm:px-6`).
- **Left Side:** Clickable `BrandLogo` (`MakeItReal` / `hacelo real`) that navigates back to the Hub (`/`).
- **Right Side — Familiar, Friendly, Aesthetic Icons (`lucide-react`, rounded stroke `strokeWidth={2.2}`):**
  - On **Onboarding**: Keep ultra-clean (just the logo and a subtle `#F0FAF5` pill badge with a `Sparkles` icon: `Entrenador IA`).
  - On **Hub**: Show 3 clean, approachable icon actions/indicators with soft rounded pill hover states (`hover:bg-[#F0FAF5]`):
    1. **Inicio / Lecciones** (`Home` or `BookOpen` icon in `#0E9F6E` when active, tooltip/label on desktop `Lecciones`).
    2. **Progreso / Logros** (`Trophy` icon tinted `#FBBF24` inside a soft warm/mint pill showing `0/2`, `1/2`, or `2/2` completed).
    3. **Mi Perfil** (`UserRound` icon in `#5B6B65` -> `#0E9F6E`, opens quick modal or view to edit nickname/stage/target role).
  - Inside an **Active Lesson (`/leccion/[id]`)**: Keep the top bar focused and distraction-free—show the `BrandLogo` (or clean `ArrowLeft` + `Salir` pill button on mobile) on the left, a smooth pill progress bar (`bg-[#F0FAF5]` track with `#0E9F6E` animated fill) in the center, and a compact step indicator (`Paso 2 de 5`) on the right.

---

## 3. Tech Stack & Deployment
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + `lucide-react` icons
- **State & Persistence:** React state + browser `localStorage` (no external DB)
- **AI Backend:** Single Next.js Route Handler (`POST /api/evaluate`) calling Google Gemini (`gemini-2.5-flash`) via `@google/genai` with **Structured Outputs (`responseMimeType: "application/json"` + `responseSchema`)**
- **Environment Variable:** `GEMINI_API_KEY` in `.env.local` (and Vercel project settings)
- **Hosting Target:** Vercel (must pass `npm run build` with zero TypeScript or lint errors)

---

## 4. Suggested Directory Structure
```text
src/
├── app/
│   ├── globals.css             # Exact color tokens, smooth animations, clean scrollbars
│   ├── layout.tsx              # Spanish lang="es", Plus Jakarta Sans font, metadata title "MakeItReal (hacelo real)"
│   ├── page.tsx                # Renders Onboarding or Hub depending on localStorage
│   ├── leccion/[id]/page.tsx   # Reusable 5-step Lesson Engine
│   └── api/
│       └── evaluate/route.ts   # Gemini structured-output grading endpoint
├── components/
│   ├── BrandLogo.tsx           # Stacked "MakeItReal" (bold/large) + "hacelo real" (thin/small)
│   ├── TopNavbar.tsx           # Sticky top navigation bar with friendly icons
│   ├── OnboardingView.tsx      # Clean welcome + optional nickname, stage, target role
│   ├── HubView.tsx             # Duolingo-style home with 2 giant rounded lesson cards
│   ├── LessonEngine.tsx        # Orchestrates Steps 1–5 + animated top progress bar
│   ├── steps/
│   │   ├── StepDiagnostic.tsx  # Step 1: Baseline answer before tips
│   │   ├── StepMicroLesson.tsx # Step 2: 3 formula cards + Weak vs Strong example
│   │   ├── StepDrills.tsx      # Step 3: 3 interactive error-detection MCQs
│   │   ├── StepPractice.tsx    # Step 4: Guided AI practice with up to 3 retries
│   │   └── StepFinalChallenge.tsx # Step 5: Unassisted challenge + Before vs After scorecard
│   └── RubricChecklist.tsx     # Visual #A7F3D0/#0E9F6E & #FBBF24 checklist for the 3 criteria
├── data/
│   └── lessons.ts              # Complete config & Spanish content for Lesson 1 & Lesson 2
├── lib/
│   └── storage.ts              # Safe SSR-compatible localStorage helpers
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## 5. Data Models (`src/types/index.ts`)
```ts
export type CareerStage =
  | '18-24 Primer empleo'
  | '25-39 Cambio de área'
  | '40+ Reinserción laboral';

export type TargetRole =
  | 'Atención al cliente'
  | 'Ventas y comercio'
  | 'Auxiliar administrativo'
  | 'Logística y bodega'
  | 'Tecnología y soporte'
  | 'Otro';

export interface UserProfile {
  nickname: string; // Optional; default to "Participante" if blank
  stage: CareerStage;
  targetRole: TargetRole;
  customRole?: string; // Used when targetRole === 'Otro'
}

export interface CriterionEvaluation {
  passed: boolean;
  label: string;
  comment: string; // Max 1 short sentence explaining why it passed or what is missing
}

export interface EvaluationResult {
  part1: CriterionEvaluation;
  part2: CriterionEvaluation;
  part3: CriterionEvaluation;
  score: number; // 0, 1, 2, or 3 (exact count of passed criteria)
  feedback: string; // Warm, direct 2-3 sentence coaching feedback (NEVER rewrites the answer)
  retryHint: string; // 1 concrete question or prompt to help the user improve on retry
}

export interface LessonProgress {
  lessonId: 'leccion-1' | 'leccion-2';
  completed: boolean;
  diagnosticAnswer?: string;
  diagnosticEval?: EvaluationResult;
  finalAnswer?: string;
  finalEval?: EvaluationResult;
  completedAt?: string;
}

export interface FormulaPart {
  id: 'part1' | 'part2' | 'part3';
  title: string;
  subtitle: string;
  tip: string;
}

export interface DrillQuestion {
  id: string;
  candidateResponse: string;
  missingPart: 'part1' | 'part2' | 'part3';
  explanation: string;
}

export interface LessonConfig {
  id: 'leccion-1' | 'leccion-2';
  number: 1 | 2;
  accentColor: 'emerald' | 'coral'; // Lesson 1 uses emerald/mint, Lesson 2 accents with soft coral (#FB7185) for visual distinction
  title: string;
  shortSubtitle: string;
  competence: string;
  estimatedMinutes: string; // "10–15 min"
  formulaName: string;
  formulaParts: [FormulaPart, FormulaPart, FormulaPart];
  weakExample: { text: string; whyWeak: string };
  strongExample: { text: string; breakdown: [string, string, string] };
  drills: [DrillQuestion, DrillQuestion, DrillQuestion];
  diagnosticQuestionTemplate: string; // Uses {role} placeholder
  practiceQuestionTemplate: string;   // Uses {role} placeholder
  finalQuestionTemplate: string;      // Distinct question, uses {role} placeholder
}
```

---

## 6. UX & Screen-by-Screen Requirements

### Screen 1: Onboarding (`OnboardingView.tsx`)
- Centered clean layout (`max-w-xl mx-auto`), plenty of breathing room on `#FFFFFF` background.
- Short, scannable welcome block (no walls of text) stating clearly[cite: 5, 9]:
  - **Headline (`#046C4E` / `#10231C`):** *"Prepárate para tu próxima entrevista, paso a paso."*
  - **Subtext (`#5B6B65`, 2 lines max):** *"Para personas en Antioquia que buscan empleo[cite: 1, 2]. Aprende en 2 lecciones cortas (10–15 min) a responder con claridad y demuestra tu avance real[cite: 3, 5]."*
- Single clean elevated white card (`bg-[#FFFFFF] border border-[#DDEAE4] rounded-3xl shadow-[0_8px_30px_rgb(16,35,28,0.06)] p-6 sm:p-8`) with 3 lightweight inputs:
  1. `¿Cómo quieres que te llamemos?` (Optional text input, placeholder: *"Ej: Camilo, Laura (opcional)"*).
  2. `Tu etapa actual` (3 soft rounded pill cards: `18-24 Primer empleo`, `25-39 Cambio de área`, `40+ Reinserción laboral`). Selected state uses `bg-[#F0FAF5] border-[#0E9F6E] text-[#046C4E]`.
  3. `Puesto al que aspiras` (Clean 2-column grid of rounded chips: `Atención al cliente`, `Ventas y comercio`, `Auxiliar administrativo`, `Logística y bodega`, `Tecnología y soporte`, `Otro` -> reveals compact text input if `Otro` is selected).
- Micro privacy note in `#5B6B65` with a tiny `ShieldCheck` icon: *"Sin registro. Tus respuestas se guardan solo en este navegador."*
- Full-width rounded CTA button (`bg-[#0E9F6E] hover:bg-[#046C4E] text-white rounded-2xl py-3.5 font-semibold`): **`Empezar ahora`**.

### Screen 2: Hub (`HubView.tsx`)
- Uses `TopNavbar` + centered container (`max-w-4xl mx-auto px-4 sm:px-6 py-8`).
- **Compact Greeting Header:**
  - `¡Hola, {nickname}!` (`text-2xl sm:text-3xl font-extrabold text-[#10231C]`)
  - Soft mint pill (`bg-[#F0FAF5] text-[#046C4E]`): `Objetivo: {role}` + subtle inline edit icon.
  - Clean horizontal progress indicator with a `#FBBF24` trophy/star badge (`X de 2 lecciones completadas`).
- **2 Giant Lesson Cards** (1 column on mobile, 2 columns on desktop, generous `gap-6`):
  - Surface: `bg-[#FFFFFF] border border-[#DDEAE4] rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(16,35,28,0.06)] hover:shadow-[0_12px_36px_rgb(14,159,110,0.12)] transition-all`.
  - Top row: Category pill (`LECCIÓN 1` in `#F0FAF5` / `#046C4E`; `LECCIÓN 2` accented gently with `#FB7185` tint `bg-[#FB7185]/10 text-[#FB7185]`) + friendly icon (`MessageSquareHeart` / `Rocket`) + Status badge (`Pendiente` in `#F0FAF5` `#5B6B65` or `Completada` in `#A7F3D0` `#046C4E` with `CheckCircle2`).
  - Clear, concise title (`text-xl font-bold text-[#10231C]`) and 1-sentence subtitle (`text-[#5B6B65]`).
  - Soft inner box (`bg-[#F0FAF5] rounded-2xl p-4`): short label **`Qué dominarás`** + concise competence description.
  - Footer: `Clock` icon + `10–15 min` (plus `Antes X/3 → Después Y/3` `#FBBF24` badge if completed) + large rounded CTA button (`Empezar lección` or `Practicar de nuevo`).

### Screen 3: Reusable 5-Step Lesson Engine (`LessonEngine.tsx`)
Centered single-column focus view (`max-w-xl mx-auto px-4 py-6 sm:py-10`) so every step feels calm, spacious, and uncrowded.

1. **Step 1 — Diagnóstico inicial (`StepDiagnostic.tsx`)**
   - Small soft coral/mint tag: `Paso 1 · Punto de partida`.
   - Role-adapted interview question inside a `#F0FAF5` speech bubble card.
   - Clean rounded textarea (`border-[#DDEAE4] focus:border-[#0E9F6E] focus:ring-4 focus:ring-[#A7F3D0]/40`, min 30 characters to submit) + gentle helper line: *"Responde como lo harías hoy en una entrevista real. No hay calificaciones malas aquí."*
   - On submit: calls `POST /api/evaluate` (`stepType: 'diagnostic'`).
   - Saves `diagnosticAnswer` and `diagnosticEval` in state/`localStorage`, shows a calm confirmation card (`bg-[#F0FAF5]` with `#A7F3D0` check icon): *"¡Listo! Guardamos tu punto de partida. Ahora veamos una fórmula sencilla para potenciarlo."* + **`Ver la fórmula`** button.

2. **Step 2 — Micro-lección (`StepMicroLesson.tsx`)**
   - Clean interactive card deck (1 focused card visible at a time with subtle dot indicators `1 / 4`, pure frontend—zero text overload):
     - Cards 1–3: Each part of the 3-part formula (`title` in `#046C4E`, short `subtitle`, highlighted `#F0FAF5` tip box with `Lightbulb` icon in `#FBBF24`).
     - Card 4: Clean visual comparison of **"Evita esto"** (subtle `#DC2626`/coral tint border) vs. **"Hazlo así"** (`#F0FAF5` background with `#0E9F6E` checkmarks).
   - Smooth `Anterior` / `Siguiente` navigation; final CTA: **`Practicar detectando errores`**.

3. **Step 3 — Detecta el error (`StepDrills.tsx`)**
   - 3 sequential Duolingo-style multiple-choice exercises (`Ejercicio 1 de 3`, pure frontend).
   - Candidate sample answer in a clean rounded quote card (`bg-[#F0FAF5] border border-[#DDEAE4]`).
   - Question: **`¿Qué parte de la fórmula le falta a esta respuesta?`**
   - 3 large, tappable white option buttons (`rounded-2xl border border-[#DDEAE4] hover:border-[#0E9F6E]`).
   - Instant visual feedback card (`#A7F3D0`/40 for correct with `#046C4E` text, `#DC2626`/10 for incorrect with `#DC2626` text) showing `drill.explanation` + **`Siguiente`** button.

4. **Step 4 — Práctica guiada con IA (`StepPractice.tsx`)**
   - Displays the role-adapted practice question and a compact, expandable/pill **3-part formula reminder** (`bg-[#F0FAF5] rounded-2xl p-3.5`).
   - Clean textarea + **`Evaluar mi respuesta`** button (`bg-[#0E9F6E]`).
   - Loading state: clean subtle pulse card (*"Tu orientador IA está revisando la estructura de tu respuesta..."*).
   - Results appear in a crisp white card:
     - `RubricChecklist`: 3 compact rows (`#A7F3D0` badge + `#046C4E` `Check` when passed; `#FBBF24`/25 badge + `AlertCircle` when needs work) with 1-sentence comment each.
     - Coaching `feedback` paragraph + highlighted `#F0FAF5` box for `retryHint`.
   - **Retry loop:**
     - If `score < 3` and `attemptNumber < 3`: primary button **`Mejorar mi respuesta (Intento X de 3)`** (scrolls/focuses textarea with their draft intact) + subtle secondary text button `"Ir al reto final"`.
     - If `score === 3` OR `attemptNumber === 3`: warm `#FBBF24`/20 celebration badge + primary button **`Ir al reto final sin ayudas`**.

5. **Step 5 — Reto final y comprobación (`StepFinalChallenge.tsx`)**
   - Soft coral accent tag (`bg-[#FB7185]/15 text-[#FB7185]`): `Reto final · Sin ayudas`.
   - Displays a **brand-new** interview question for their target role with **no formula hints visible**[cite: 3, 9].
   - On submit: calls `POST /api/evaluate` (`stepType: 'final'`).
   - Saves lesson completion to `localStorage` and reveals the **Comprobación de aprendizaje (Antes vs. Después)** screen[cite: 3, 9]:
     - Clean 2-card comparison: **Antes (`X/3`)** vs. **Después (`Y/3`)** with checkmarks for each criterion and an honest summary of progress (never claim full mastery if `Y < 3`; encourage effort and highlight the remaining part to keep practicing)[cite: 9].
     - Clean `#F0FAF5` card containing their final answer + **`Copiar mi respuesta`** button (with `Copy` / `Check` confirmation).
     - Primary CTA: **`Volver a mis lecciones`**.

---

## 7. Complete Spanish Lesson Content (`src/data/lessons.ts`)

### Lesson 1: `"Cuéntame sobre ti" en 60 segundos`
- **id:** `leccion-1`
- **accentColor:** `emerald`
- **shortSubtitle:** Presenta tu perfil con claridad en el primer minuto sin bloquearte ni contar toda tu vida.
- **competence:** Estructurar una presentación profesional usando **Quién soy → Un logro concreto → Por qué encajo en este puesto**.
- **estimatedMinutes:** `10–15 min`
- **formulaName:** Fórmula Q-L-E (Quién soy → Logro → Encaje)
- **formulaParts:**
  1. `part1` — **Quién soy:** Tu perfil actual, formación o área principal en 1 o 2 frases (sin recitar tu biografía personal). *Tip:* Empieza por tu rol o fortaleza laboral, no por tu edad ni tu estado civil.
  2. `part2` — **Un logro concreto:** Un ejemplo real de algo que hiciste bien (en un trabajo, negocio familiar, estudio o proyecto). *Tip:* Menciona un resultado o acción medible, aunque sea pequeño.
  3. `part3` — **Por qué encajo en este puesto:** Conecta lo que sabes hacer con lo que necesita la empresa hoy. *Tip:* Cierra diciendo qué valor puntual le aportarías al equipo.
- **weakExample:**
  - *text:* "Bueno, yo soy Mateo, tengo 22 años, vivo en Bello con mi familia. Me considero una persona muy responsable, honesta y con muchas ganas de trabajar en lo que salga."
  - *whyWeak:* Da datos personales irrelevantes, usa adjetivos genéricos sin pruebas y no explica por qué sirve para el puesto.
- **strongExample:**
  - *text:* "Soy técnico en gestión administrativa y durante el último año apoyé el control de pedidos y facturación en el negocio de mi tía. Logré organizar el inventario en Excel y reducir los errores de despacho casi a cero. Por eso me interesa este puesto de auxiliar: puedo aportar orden desde el primer día y adaptarme rápido a sus procesos."
  - *breakdown:*
    - "Quién soy: Técnico en gestión administrativa con experiencia práctica en pedidos."
    - "Logro concreto: Organizó inventario en Excel y redujo errores de despacho."
    - "Por qué encajo: Conecta su orden y rapidez con el puesto de auxiliar."
- **drills:**
  1. *candidateResponse:* "Soy estudiante de últimos semestres de sistemas y el año pasado creé una hoja de cálculo automatizada que ahorró 4 horas semanales de reportes en una microempresa local."
     - `missingPart`: `part3`
     - `explanation`: "Tiene perfil claro y un logro concreto excelente, pero olvidó cerrar conectando eso con el puesto al que está aplicando."
  2. *candidateResponse:* "Tengo experiencia en atención al cliente en tiendas de barrio y me gustaría trabajar aquí porque sé que valoran el buen trato y puedo ayudarles a fidelizar clientes."
     - `missingPart`: `part2`
     - `explanation`: "Dice quién es y por qué encaja, pero falta un logro concreto o ejemplo verificable que demuestre ese buen trato."
  3. *candidateResponse:* "El semestre pasado coordiné las entregas de un emprendimiento de repostería sin ningún retraso en temporada navideña, y quiero traer esa misma puntualidad a su equipo de logística."
     - `missingPart`: `part1`
     - `explanation`: "Incluye un gran logro y lo conecta con el puesto, pero arranca sin presentar brevemente quién es o cuál es su perfil actual."
- **diagnosticQuestionTemplate:** `Estás en una entrevista para {role}. El entrevistador te sonríe y te dice: "Para empezar, cuéntame un poco sobre ti". ¿Qué responderías hoy?`
- **practiceQuestionTemplate:** `Imagina que llegas a la entrevista para {role} y te piden presentarte en menos de un minuto: "Cuéntame sobre ti". Aplica la fórmula de 3 partes.`
- **finalQuestionTemplate:** `Un reclutador te llama por teléfono para una vacante de {role} y te dice: "Tengo dos minutos antes de mi siguiente reunión, resúmeme tu perfil y por qué deberíamos considerarte". Responde sin ayudas:`

### Lesson 2: `Responder cuando "no tienes experiencia"`
- **id:** `leccion-2`
- **accentColor:** `coral`
- **shortSubtitle:** Convierte proyectos de estudio, trabajos informales o logros propios en evidencia real ante preguntas difíciles.
- **competence:** Responder objeciones sobre falta de experiencia formal usando **Contexto honesto → Habilidad transferible → Prueba concreta**.
- **estimatedMinutes:** `10–15 min`
- **formulaName:** Fórmula C-H-P (Contexto honesto → Habilidad transferible → Prueba concreta)
- **formulaParts:**
  1. `part1` — **Contexto honesto:** Reconoce con seguridad y sin disculparte que es tu primer empleo formal en ese cargo (sin inventar experiencia). *Tip:* Evita frases como "perdón, no sé nada". Habla con serenidad.
  2. `part2` — **Habilidad transferible:** Nombra la capacidad práctica que SÍ tienes y que aplica directo al cargo (trato al público, organización, manejo de herramientas, resolución de problemas). *Tip:* Piensa qué hace esa persona todos los días en el puesto.
  3. `part3` — **Prueba concreta:** Demuestra esa habilidad con un hecho real de tu vida (negocio familiar, voluntariado, estudio, ventas propias o deportes). *Tip:* Un ejemplo pequeño y real vale más que diez promesas.
- **weakExample:**
  - *text:* "La verdad no tengo experiencia porque nadie me da la oportunidad, pero si me contratan yo aprendo rapidísimo y le pongo toda la actitud."
  - *whyWeak:* Suena defensiva, no identifica ninguna habilidad útil para el cargo y solo ofrece una promesa sin evidencia.
- **strongExample:**
  - *text:* "Aunque todavía no he tenido un contrato formal en ventas, tengo mucha facilidad para escuchar necesidades y explicar productos con claridad. Durante seis meses vendí accesorios por WhatsApp e Instagram para un emprendimiento propio, respondiendo dudas y cerrando más de 40 pedidos sin devoluciones."
  - *breakdown:*
    - "Contexto honesto: Reconoce sin pena que no ha tenido contrato formal en ventas."
    - "Habilidad transferible: Escucha activa y claridad al explicar productos."
    - "Prueba concreta: Más de 40 pedidos cerrados por WhatsApp e Instagram sin devoluciones."
- **drills:**
  1. *candidateResponse:* "No he trabajado antes en una oficina formal, pero soy muy organizado, manejo bien Google Drive y Excel, y me adapto rápido a sistemas nuevos."
     - `missingPart`: `part3`
     - `explanation`: "Es honesto y nombra habilidades útiles, pero no da una prueba concreta de dónde las aplicó realmente."
  2. *candidateResponse:* "Sé manejar conflictos con clientes difíciles; cuando ayudaba en la cafetería de mi mamá los fines de semana, logré calmar a varios clientes molestos por demoras y volvieron la semana siguiente."
     - `missingPart`: `part1`
     - `explanation`: "Tiene una gran habilidad y prueba real, pero omitió responder frontalmente y con naturalidad a la pregunta sobre su falta de experiencia formal."
  3. *candidateResponse:* "Es cierto que sería mi primer empleo formal en bodega. El año pasado ayudé a mis vecinos a organizar la mudanza de todo un local comercial y no se perdió ni una sola caja."
     - `missingPart`: `part2`
     - `explanation`: "Es honesto y da una anécdota real, pero le faltó nombrar explícitamente la habilidad transferible que eso demuestra (por ejemplo: clasificación, control de inventario o trabajo en equipo)."
- **diagnosticQuestionTemplate:** `En la entrevista para {role}, la persona revisa tu hoja de vida y te pregunta: "Veo que no tienes experiencia formal en este cargo, ¿por qué deberíamos elegirte?". ¿Qué responderías hoy?`
- **practiceQuestionTemplate:** `Te preguntan en la entrevista para {role}: "No tienes experiencia certificada en este puesto, ¿qué te hace pensar que puedes desempeñarlo bien?". Usa la fórmula de 3 partes.`
- **finalQuestionTemplate:** `El entrevistador para {role} te dice: "Los otros candidatos ya han trabajado en empresas similares y tú no. ¿Qué tienes a tu favor?". Responde sin ayudas:`

---

## 8. Backend AI Grading Contract (`src/app/api/evaluate/route.ts`)

### Request Body
```ts
{
  lessonId: 'leccion-1' | 'leccion-2',
  stepType: 'diagnostic' | 'practice' | 'final',
  targetRole: string,
  stage: string,
  question: string,
  userAnswer: string,
  attemptNumber?: number
}
```

### Gemini Prompt & Guardrails
- Use `@google/genai` with model `gemini-2.5-flash` and a strict JSON `responseSchema` matching `EvaluationResult`.
- **System instructions for the model:**
  1. You are a warm, practical employability coach in Antioquia, Colombia[cite: 1, 2]. Write in clear, respectful, everyday Spanish (*tú* form) without corporate jargon[cite: 9].
  2. Evaluate `userAnswer` **strictly** against the 3 criteria of the corresponding lesson (`leccion-1`: Quién soy / Un logro concreto / Por qué encajo en este puesto; `leccion-2`: Contexto honesto / Habilidad transferible / Prueba concreta).
  3. Be fair but honest: do NOT mark a criterion as `passed: true` if the answer is vague, generic (e.g., *"soy responsable y aprendo rápido"* without evidence), or off-topic. If the user writes gibberish or fewer than 10 meaningful words, mark all 3 as `false`.
  4. **CRITICAL RULE:** NEVER write, rewrite, or give a ready-made replacement paragraph for the user[cite: 2, 4]. Only diagnose what worked, explain what is missing, and ask 1 concrete guiding question in `retryHint` so the user improves their own text[cite: 9].
  5. Compute `score` as the exact integer count (`0` to `3`) of `passed === true` criteria.
  6. Keep each criterion `comment` under 18 words, `feedback` to 2–3 crisp sentences, and `retryHint` to 1 actionable question.

### Validation & Security
- Validate inputs on the server (reject empty `userAnswer`, cap length at 2,000 characters).
- Never expose `GEMINI_API_KEY` to the client.
- If `GEMINI_API_KEY` is missing or Gemini throws an error, return HTTP `500` with `{ error: "No pudimos conectar con el orientador IA. Intenta de nuevo en unos segundos." }` so the UI shows a clean retry button.

---

## 9. Pre-Deploy Verification Checklist
Before finishing, verify:
1. `npm run build` succeeds cleanly with zero TypeScript or ESLint errors.
2. Visual audit matches exact HEX palette (`#FFFFFF`, `#F0FAF5`, `#0E9F6E`, `#046C4E`, `#A7F3D0`, `#10231C`, `#5B6B65`, `#FBBF24`, `#FB7185`, `#DC2626`, `#DDEAE4`), displays `MakeItReal` (bold/large) + `hacelo real` (thin/small) in the sticky top navbar, and feels airy and uncluttered.
3. App works end-to-end in an **incognito browser window** from onboarding → Hub → Lesson 1 (Steps 1–5) → Hub (`Completada`) → Lesson 2 (Steps 1–5)[cite: 3, 5].
4. Layout looks crisp and requires zero horizontal scrolling at `375px` mobile width[cite: 2, 9].
5. Refreshing the page preserves profile and completed lesson badges via `localStorage`.
6. Submitting a weak answer (e.g., *"Hola, soy trabajador y quiero el empleo"*) genuinely fails the missing criteria (`score < 3`) and triggers coaching feedback without the AI rewriting the answer for the user[cite: 2, 4, 9].