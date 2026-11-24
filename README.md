# MakeItReal (hacelo real)

Herramienta web de aprendizaje con IA para preparar entrevistas de trabajo paso a paso, diseñada para personas que buscan empleo en Antioquia (**Expl-AI-n Challenge 2026: Antioquia sin brechas × Universidad de Medellín**).

## Qué enseña

1. **Lección 1 — "Cuéntame sobre ti" en 60 segundos:** Fórmula **Q-L-E** (*Quién soy → Un logro concreto → Por qué encajo en este puesto*).
2. **Lección 2 — Responder cuando "no tienes experiencia":** Fórmula **C-H-P** (*Contexto honesto → Habilidad transferible → Prueba concreta*).

Cada lección recorre 5 pasos: diagnóstico inicial, micro-lección interactiva, detección de errores, práctica guiada con IA (hasta 3 intentos con pistas sin reescribir la respuesta) y reto final sin ayudas con comparación **Antes vs. Después**.

## Stack técnico

- **Framework:** Next.js (App Router) + TypeScript
- **Estilos:** Tailwind CSS + `lucide-react`
- **IA:** Google Gemini (`gemini-2.5-flash`) vía `@google/genai` con salidas estructuradas (`responseSchema`) en `POST /api/evaluate`
- **Persistencia:** `localStorage` del navegador (sin registro, sin base de datos)

## Configuración local

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea `.env.local` a partir de `.env.local.example` y agrega tu clave de Gemini:
   ```bash
   GEMINI_API_KEY=tu_clave_aqui
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Verifica compilación y lint antes de desplegar:
   ```bash
   npm run lint
   npm run build
   ```
