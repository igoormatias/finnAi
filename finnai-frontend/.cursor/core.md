# Core Frontend Rules

> Detalhes completos: [rules.md](./rules.md) · Qualidade: [quality.md](./quality.md) · Agents: [../AGENTS.md](../AGENTS.md)

## Estrutura

* Feature-based (`src/features/<feature>`)
* Separar: `components/` · `hooks/` · `services/` · `utils/` · `types/`
* `src/components/` — UI compartilhada (layout, states, ui)

## Naming

* **Componentes:** `ComponentName/ComponentName.tsx` (PascalCase), arrow functions
* **Hooks / services / utils:** pasta e arquivo kebab-case (`use-auth/use-auth.ts`)

## Organização

* Cada módulo: pasta própria + `index.ts` (barrel)
* Importar via barrel (`@/features/workspaces`, `@/components/ui`)
* Nunca deep import de arquivos internos

## Testes

* Colocalizados com o módulo; sem `__tests__/` em features
* Obrigatório para hooks com lógica, utils, services

## Geral

* Evitar arquivos genéricos (`utils.ts`, `helpers.ts`)
* Tailwind v4: classes canônicas — ver `rules.md`
