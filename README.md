# n8n Ops Dashboard

Dashboard de operaciones en tiempo real para monitorear ejecuciones de n8n y gasto en OpenAI. Construido con Next.js 15 + Recharts, desplegado en Vercel.

**Live:** [dashboard-nine-phi-80.vercel.app](https://dashboard-nine-phi-80.vercel.app)

---

## Qué muestra

| Sección | Detalle |
|---------|---------|
| **KPIs** | Total de ejecuciones, tasa de éxito, fallas, gasto OpenAI |
| **Tendencia diaria** | Costo OpenAI + ejecuciones por día (gráfico de líneas) |
| **Top workflows** | Ejecuciones por workflow (bar chart horizontal) |
| **Tabla de workflows** | Detalle por workflow: tokens, costo total, costo/ejecución, modelo principal, sparkline de errores |
| **API Keys OpenAI** | Desglose de gasto por API key y proyecto |

Filtros de período: últimos 7, 30 o 90 días, y rango personalizado.

---

## Arquitectura

```
[n8n Webhooks]
  /webhook/dashboard/summary    ←→   /app/api/summary/route.ts
  /webhook/dashboard/workflows  ←→   /app/api/workflows/route.ts
                                           ↓
                                   [Next.js en Vercel]
                                           ↓
                                   [DashboardContent.tsx]
                                   KpiCard / Charts / Tables
```

El frontend llama a sus propios API routes de Next.js (server-side), que actúan de proxy hacia los webhooks de n8n. Esto evita problemas de CORS y oculta la URL de la instancia al cliente.

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Charts:** Recharts
- **Estilos:** Tailwind CSS
- **Lenguaje:** TypeScript
- **Deploy:** Vercel
- **Datos:** n8n Webhooks API (instancia propia en EasyPanel)

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `N8N_WEBHOOK_BASE_URL` | URL base de la instancia n8n (ej: `https://mi-instancia.easypanel.host`) |

Crear un `.env.local` en la raíz del proyecto:

```env
N8N_WEBHOOK_BASE_URL=https://mi-instancia.easypanel.host
```

En Vercel, agregar la variable en **Settings → Environment Variables**.

---

## Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Requiere que los workflows de n8n estén activos y accesibles desde tu red.

---

## Workflows de n8n requeridos

El dashboard depende de dos webhooks GET activos en n8n:

| Endpoint | Descripción |
|----------|-------------|
| `GET /webhook/dashboard/summary` | KPIs globales, serie diaria, desglose por API key |
| `GET /webhook/dashboard/workflows` | Detalle por workflow con consumo OpenAI |

Ambos aceptan los params `start` y `end` (unix timestamp) para filtrar el período.

Los workflows leen directamente de la n8n Executions API y la OpenAI Usage API en tiempo real — no usan base de datos intermedia.

---

## Estructura del proyecto

```
dashboard/
├── app/
│   ├── api/
│   │   ├── summary/route.ts      # Proxy → n8n webhook summary
│   │   └── workflows/route.ts    # Proxy → n8n webhook workflows
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── DashboardContent.tsx      # Componente raíz con estado y fetching
│   ├── KpiCard.tsx
│   ├── DailyCostChart.tsx        # Recharts LineChart
│   ├── WorkflowBarChart.tsx      # Recharts BarChart horizontal
│   ├── WorkflowTable.tsx         # Tabla sorteable con sparklines
│   └── ApiKeyTable.tsx           # Tabla de gasto por API key
├── types/
│   └── dashboard.ts              # Interfaces TypeScript
└── lib/
    └── api.ts
```
