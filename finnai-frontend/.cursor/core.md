# Core Frontend Rules

## Estrutura

* Usar feature-based (`src/features/<feature>`)
* Separar responsabilidades: components / hooks / utils / context
* Não misturar responsabilidades na mesma pasta

## Naming

* Componentes: PascalCase
* Arquivos: kebab-case
* Hooks: useSomething.ts

## Organização

* Cada módulo deve ter pasta própria
* Todo módulo deve ter `index.ts` (barrel)
* Nunca importar arquivos internos diretamente

## Hooks

* Criar hook quando houver lógica/estado
* Hooks com lógica devem ter testes

## Testes

* Obrigatório para:

  * hooks com lógica
  * utils
* Não testar UI simples

## Regras gerais

* Evitar arquivos genéricos (`utils.ts`, `helpers.ts`)
* Evitar nomes genéricos (`data`, `res`, `item`)
* Se não sabe onde colocar o arquivo → estrutura está errada
* **Tailwind v4:** preferir classes canônicas (`bg-white/2`, `border-white/10`) em vez de opacidade arbitrária (`bg-white/[0.02]`) — ver `rules.md` § Tailwind
