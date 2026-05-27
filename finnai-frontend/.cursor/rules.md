# Frontend Architecture Rules

## 🎯 Objetivo

Garantir código **previsível, consistente e escalável**.

---

## 🧱 Arquitetura (Feature-based)

### Regra principal

Cada domínio vive em:

```bash
src/features/<feature-name>/
```

### Estrutura padrão

```bash
features/
  portfolio/
    components/     # UI da feature
    pages/          # composição
    hooks/          # hooks reutilizáveis da feature
    services/       # API / integrações
    types/          # contratos
    utils/          # funções puras
```

---

## 🧩 Shared layer (reutilizável)

Tudo que é reutilizável entre features deve viver em:

```bash
src/shared/
  ui/
  lib/
  api/
  types/
  styles/
```

Use imports por alias (`@/shared/*` ou `@shared/*`) para manter caminhos estáveis.

---

## 📦 Organização por responsabilidade

Separar sempre:

* `components/` → UI
* `hooks/` → comportamento
* `utils/` → funções puras
* `context/` → estado global

### ❌ Errado

```bash
active-section/
  ActiveSectionProvider.tsx
  NavSection.tsx
  navHashToId.ts
```

### ✅ Correto

```bash
active-section/
  context/
    ActiveSectionProvider.tsx

  utils/
    nav-hash-to-id.ts

navigation/
  NavSection.tsx
```

---

## 🧠 Naming (OBRIGATÓRIO)

### Componentes React

- Pasta e arquivo principal: **PascalCase** (`WorkspaceHubPage/WorkspaceHubPage.tsx`)
- Export: **arrow function** com props tipadas (`ComponentName.types.ts` quando necessário)
- Evitar `export function` em componentes

### Hooks, services, utils

```bash
use-workspace-members/use-workspace-members.ts   # kebab-case
workspace-service/workspace-service.ts
invite-link/invite-link.ts
```

### Hooks (nome do arquivo)

```bash
use-something.ts
```

---

## 📦 Barrel exports (OBRIGATÓRIO)

Todo módulo relevante: pasta própria + `index.ts`.

```ts
// ✅ correto
import { WorkspaceHubPage } from "@/features/workspaces";
import { Button } from "@/components/ui";

// ❌ errado — deep import
import { WorkspaceHubPage } from "@/features/workspaces/components/WorkspaceHubPage/WorkspaceHubPage";
```

---

### ❌ Evitar

* `navHashToId.ts`
* `utils.ts`
* nomes genéricos (`data`, `res`, `item`)

---

## ⚛️ Next.js (App Router)

### Regras

* Server Components por padrão
* `'use client'` só quando necessário
* `page.tsx` deve ser fino

```tsx
export default function Page() {
  return <FeaturePage />
}
```

---

## 📱💻 Responsividade (OBRIGATÓRIO)

### Regra

- O site deve ser **responsivo** e **mobile-first**.
- Os prints em `assets/` são referência visual oficial, mas são majoritariamente **desktop**. Toda tela deve:
  - ser implementada com base no desktop;
  - ser **adaptada para mobile/tablet** (não “espremer” desktop no mobile);
  - simplificar navegação quando necessário (sidebar → drawer, menus compactos, cards reordenados).
- **Desktop** não pode ser “mobile esticado”.
- **Mobile** não pode ser “desktop comprimido”.

### Breakpoints
- **Desktop**: `>= 1024px` (`lg:`)

### Diretrizes desktop (baseline)
- Preferir **sidebar fixa** + **topbar** + conteúdo com `max-width` elegante
- Usar grid consistente, espaço negativo, borders discretos e glow verde sutil
- No desktop, **não usar FAB flutuante** do mobile; usar CTA fixo (ex.: “Nova Escalação”)

---

## ✅ Testes (OBRIGATÓRIO)

### Regra
- **Toda alteração de código deve incluir teste novo ou teste atualizado.**
- Exceções permitidas: **docs** (`*.md`) e **chore/config sem lógica** (ex.: formatação, renome de pasta, configs sem comportamento).

### Colocalização (OBRIGATÓRIO)

- Testes ficam **ao lado** do módulo (`WorkspaceSwitcher.test.tsx` junto de `WorkspaceSwitcher.tsx`).
- **Proibido** pasta `__tests__/` dentro de `src/features/*`.

### Tipos de teste

- **Unit**: `*.test.ts` para `utils/`, `services/` e funções puras
- **Component**: `*.test.tsx` com Testing Library para componentes React

### Antes de finalizar uma tarefa

Rodar sempre:

```bash
pnpm lint
pnpm test
pnpm build
```

---

### Dados

* Buscar no servidor sempre que possível
* Evitar `useEffect` para fetch simples

---

### Boas práticas

* Usar `next/link` e `next/image`
* Validar params
* Não expor secrets no client

---

## 🎨 Tailwind

### Regras

* ❌ Não usar cores hardcoded
* ✅ Usar tokens (primary, muted, etc.)
* ❌ Evitar valores arbitrários quando existir equivalente canônico no Tailwind v4

### Classes canônicas (Tailwind v4 — `suggestCanonicalClasses`)

O IntelliSense do Tailwind v4 sugere **classes canônicas** em vez de valores arbitrários entre colchetes. Siga esse padrão para evitar warnings no editor.

**Opacidade em cores** — use o modificador `/N` da escala (0–100), não `/[0.0N]`:

| ❌ Evitar | ✅ Preferir |
|----------|------------|
| `bg-white/[0.02]` | `bg-white/2` |
| `bg-white/[0.05]` | `bg-white/5` |
| `bg-black/[0.30]` | `bg-black/30` |
| `border-white/[0.08]` | `border-white/8` |
| `text-primary/[0.80]` | `text-primary/80` |

**Regra prática:** se a opacidade for um percentual inteiro (2%, 5%, 10%, 20%…), escreva `cor/N` diretamente.

**Quando usar colchetes `[...]`:** apenas quando **não** houver equivalente na escala (ex.: `max-w-[380px]`, `tracking-[0.18em]`, sombras custom com valores únicos do design).

**Ordem de preferência:**
1. Tokens do projeto (`bg-primary`, `border-white/10`, `text-profile-bg`)
2. Modificadores canônicos (`/2`, `/10`, `/80`)
3. Valores arbitrários `[...]` só se inevitáveis

---

## 📏 Tamanho de arquivos

* > 100 linhas → dividir

```bash
ComponentName/
  ComponentName.tsx
  fragments/
```

---

## 🧩 fragments/

* Subcomponentes pequenos
* Uso interno
* Não reutilizáveis fora

---

## 🧠 Regra de ouro

Se você não sabe onde colocar um arquivo:

👉 a estrutura está errada
