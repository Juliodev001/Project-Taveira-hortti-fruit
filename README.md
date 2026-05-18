# Project Taveira — Hortti Fruit

Sistema web desenvolvido como freela para uma floricultura e hortifruti. Foi o meu primeiro projeto entregue para um cliente real.

## Funcionalidades

- Dashboard com visão geral do negócio
- Cadastro e gestão de produtos
- Controle de estoque
- Registro de vendas
- Autenticação com Next Auth
- Área de impressão de relatórios

## Stack

- **Front-end:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Back-end:** Next.js API Routes, Prisma ORM
- **Banco de dados:** PostgreSQL
- **Auth:** NextAuth v5 com Prisma Adapter
- **Outros:** React Hook Form, Zod, Recharts

## Como rodar

```bash
npm install

cp .env.example .env
# Configure DATABASE_URL e AUTH_SECRET no .env

npx prisma migrate dev

npm run dev
```

Acesse `http://localhost:3000`
