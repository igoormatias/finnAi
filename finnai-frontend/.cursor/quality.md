# Frontend Quality Rules

> Fonte canônica de arquitetura: [rules.md](./rules.md) · Checklist agents: [../AGENTS.md](../AGENTS.md)

## 🎯 Objetivo

Garantir **qualidade, consistência e manutenibilidade**.

---

## 📦 Estrutura + Exports (OBRIGATÓRIO)

### Regra

Todo módulo relevante deve ter:

* pasta própria
* `index.ts` (barrel)
* export controlado

---

### Exemplo (hook)

```bash
useBackToTopVisibility/
  useBackToTopVisibility.ts
  useBackToTopVisibility.test.ts
  index.ts
```

### index.ts

```ts
export * from './useBackToTopVisibility'
```

---

## 🚫 Imports proibidos

```ts
// ❌ errado
import { useBackToTopVisibility } from './useBackToTopVisibility/useBackToTopVisibility'

// ✅ correto
import { useBackToTopVisibility } from './useBackToTopVisibility'
```

---

## 🧪 Testes (OBRIGATÓRIO quando aplicável)

### Deve testar

* Hooks com:

  * `useEffect`
  * estado
  * eventos (scroll, resize)
  * lógica condicional

* Utils

* Lógica de negócio

---

### Não precisa testar

* Componentes puramente visuais
* Render simples

---

### Estrutura

```bash
useSomething/
  useSomething.ts
  useSomething.test.ts
```

---

### Padrão

```ts
useSomething.test.ts
```

---

### Ferramentas

* Vitest
* Testing Library

---

## 🧠 Boas práticas de teste

* Testar comportamento, não implementação
* Evitar mocks desnecessários
* Mockar `window/document` quando necessário

---

## ⚛️ Hooks

### Criar hook quando:

* tem estado
* tem efeito
* tem lógica

### Não criar:

* só render

---

## 🔁 Reutilização

Criar hooks para:

* lógica repetida
* estado compartilhado
* integração com API

---

## 🧼 Clean Code

### Handlers

```ts
handleClick
handleSubmit
handleClose
```

---

### Booleans

```ts
isLoading
isOpen
hasError
```

---

### Nomeação

* ❌ data, res, item
* ✅ user, order, response

---

## 💬 Comentários

* ❌ Não comentar o óbvio
* ✅ Explicar decisões

---

## 🚫 Anti-patterns

* Criar pasta sem necessidade
* Não usar `index.ts`
* Importar direto ignorando barrel
* Criar teste irrelevante

---

## 🧠 Regra final

Se tem lógica relevante:

👉 precisa de teste
👉 precisa de estrutura
👉 precisa de padrão
