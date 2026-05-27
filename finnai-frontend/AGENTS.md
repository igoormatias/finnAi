# FinnAI Frontend — Agent Guide

**Leia antes de qualquer alteração de código:**

1. [`.cursor/rules.md`](.cursor/rules.md) — arquitetura, naming, Next.js, testes
2. [`.cursor/quality.md`](.cursor/quality.md) — barrels, testes colocalizados, clean code
3. [`.cursor/core.md`](.cursor/core.md) — resumo executivo

## Checklist obrigatório

- [ ] Feature-based: `src/features/<feature>/`
- [ ] Componentes: pasta `ComponentName/` + `ComponentName.tsx` (PascalCase), **arrow functions**
- [ ] Hooks/services/utils: pasta kebab-case + `index.ts` barrel
- [ ] Testes **colocalizados** (`ComponentName.test.tsx` ao lado do módulo) — **não** usar `__tests__/` em features
- [ ] Imports via barrel: `@/features/<feature>`, `@/components/ui` — evitar deep imports
- [ ] `page.tsx` fino; lógica na feature
- [ ] Rodar antes de concluir: `pnpm lint`, `pnpm test`, `pnpm build`

## Comandos

```bash
npx -y pnpm@10.17.0 install
npx -y pnpm@10.17.0 dev
npx -y pnpm@10.17.0 test
npx -y pnpm@10.17.0 build
```

## Estrutura de referência

```text
features/workspaces/
  components/WorkspaceHubPage/WorkspaceHubPage.tsx
  hooks/use-workspace-members/use-workspace-members.ts
  services/workspace-service/workspace-service.ts
  index.ts
```
