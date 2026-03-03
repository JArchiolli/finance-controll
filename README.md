# 💰 Finance — Sistema de Controle Financeiro

Sistema de controle financeiro com visualização mensal (Janeiro a Dezembro), agrupamento de contas, autenticação por role e dashboard com gráficos.

## 🏗️ Arquitetura

```
backend/
├── src/
│   ├── modules/           # Módulos de domínio (auth, user, group, account, entry, dashboard)
│   │   └── [module]/
│   │       ├── *.controller.ts   # Camada HTTP — recebe request, delega ao service
│   │       ├── *.service.ts      # Camada de negócio — regras e orquestração
│   │       ├── *.repository.ts   # Camada de dados — abstrai o Prisma
│   │       ├── *.routes.ts       # Definição de rotas do módulo
│   │       └── *.dto.ts          # Validação de entrada com Zod
│   ├── shared/            # Código compartilhado (errors, middlewares, utils)
│   └── infra/             # Infraestrutura (database, http server, config)
├── prisma/                # Schema e seeds do Prisma
└── Dockerfile

frontend/
├── src/
│   ├── pages/             # Páginas da aplicação
│   ├── components/        # Componentes reutilizáveis (Layout, UI)
│   ├── services/          # Camada de comunicação com a API
│   ├── contexts/          # React Context (Auth)
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types compartilhados
│   └── styles/            # Estilos globais (Tailwind)
└── Dockerfile
```

## 🧩 Padrões de Projeto

| Padrão | Onde | Por quê |
|--------|------|---------|
| **Repository Pattern** | `*.repository.ts` | Abstrai o acesso a dados, facilita testes e troca de ORM |
| **Service Layer** | `*.service.ts` | Isola regras de negócio da camada HTTP |
| **DTO + Validation** | `*.dto.ts` (Zod) | Validação tipada nas bordas do sistema |
| **Middleware Chain** | `ensureAuth`, `ensureRole` | Composição de middlewares para auth e autorização |
| **Modular Monolith** | `modules/` | Organização por domínio sem over-engineering |
| **Centralized Error Handling** | `AppError` + `errorHandler` | Tratamento consistente de erros em toda a API |

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, TypeScript, Prisma, Zod, JWT
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts
- **Database**: PostgreSQL
- **Infra**: Docker, docker-compose

## 🚀 Como rodar

### Com Docker (recomendado)

```bash
docker-compose up -d
```

- **API**: http://localhost:3333
- **Frontend**: http://localhost:5173

### Sem Docker

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```
## 📡 Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | Usuário logado | ✅ |
| GET | `/api/users` | Listar usuários | ✅ ADMIN |
| POST | `/api/users` | Criar usuário | ✅ ADMIN |
| PUT | `/api/users/:id` | Atualizar usuário | ✅ ADMIN |
| DELETE | `/api/users/:id` | Deletar usuário | ✅ ADMIN |
| GET | `/api/groups` | Listar grupos com contas | ✅ |
| POST | `/api/groups` | Criar grupo | ✅ ADMIN |
| PUT | `/api/groups/:id` | Atualizar grupo | ✅ ADMIN |
| DELETE | `/api/groups/:id` | Deletar grupo | ✅ ADMIN |
| POST | `/api/accounts` | Criar conta | ✅ ADMIN |
| PUT | `/api/accounts/:id` | Atualizar conta | ✅ ADMIN |
| DELETE | `/api/accounts/:id` | Deletar conta | ✅ ADMIN |
| GET | `/api/entries?year=2026` | Listar lançamentos do ano | ✅ |
| POST | `/api/entries` | Criar/atualizar lançamento | ✅ ADMIN |
| PUT | `/api/entries/:id` | Atualizar lançamento | ✅ ADMIN |
| DELETE | `/api/entries/:id` | Deletar lançamento | ✅ ADMIN |
| GET | `/api/dashboard?year=2026` | Dados do dashboard | ✅ |
