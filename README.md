# 🍽️ MealFlow

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</p>

**MealFlow** é uma aplicação completa de planejamento de refeições e gerenciamento de despensa, projetada para ajudar famílias e indivíduos a organizar suas refeições semanais, controlar ingredientes em casa e gerar listas de compras automaticamente.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Visão Geral

O MealFlow resolve o problema comum de "O que vamos comer hoje?" através de:

- **Planejamento de Refeições**: Organize suas refeições para a semana inteira
- **Gerenciamento de Despensa**: Saiba exatamente o que você tem em casa
- **Receitas Personalizadas**: Cadastre e organize suas receitas favoritas
- **Listas de Compras Inteligentes**: Geração automática baseada no planejamento semanal
- **Gestão de Família**: Compartilhe tudo com membros do seu household

## ✨ Funcionalidades

### 🏠 Households (Famílias)
- Criação de grupos familiares
- Convite de membros
- Compartilhamento de receitas, despensa e planejamentos

### 📖 Receitas
- Cadastro de receitas com ingredientes e instruções
- Busca e filtro de receitas
- Categorização por tipo de refeição

### 🥫 Despensa (Pantry)
- Controle de itens em estoque
- Quantidade e unidades de medida
- Verificação de disponibilidade para receitas

### 📅 Planejamento de Refeições
- Planejamento semanal
- Diferentes tipos de refeição (café da manhã, almoço, jantar, etc.)
- Vinculação com receitas cadastradas

### 🛒 Listas de Compras
- Geração automática a partir do planejamento semanal
- Considera itens já disponíveis na despensa
- Marcação de itens comprados

### 🍽️ Tipos de Refeição
- Customização de tipos de refeição
- Flexibilidade para diferentes culturas alimentares

## 🏗️ Arquitetura

O projeto segue uma arquitetura de **monorepo** com três aplicações principais:

```
mealflow/
├── backend/     # API REST (Laravel 12)
├── web/         # Aplicação Web (React 19 + Vite)
└── mobile/      # Aplicação Mobile (React Native + Expo)
```

### Diagrama de Arquitetura

```
┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │
│  (React + Vite) │     │ (React Native)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
           ┌─────────────────┐
           │   Laravel API   │
           │   (Sanctum)     │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │    Database     │
           │   (MySQL/SQLite)│
           └─────────────────┘
```

## 🛠️ Tecnologias

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| PHP | 8.2+ | Linguagem de programação |
| Laravel | 12 | Framework PHP |
| Laravel Sanctum | 4.0 | Autenticação de API |

### Web
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React | 19 | Biblioteca UI |
| TypeScript | 5.9 | Tipagem estática |
| Vite | 7.2 | Build tool |
| TailwindCSS | 4.1 | Framework CSS |
| React Router | 7.10 | Roteamento |
| Axios | 1.13 | Cliente HTTP |
| Shadcn UI | - | Componentes acessíveis |

### Mobile
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React Native | 0.81 | Framework mobile |
| Expo | 54 | Plataforma de desenvolvimento |
| TypeScript | 5.9 | Tipagem estática |
| React Navigation | 7.1 | Navegação |

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 20.x
- **npm** ou **yarn**
- **MySQL** ou **SQLite**
- **Expo CLI** (para desenvolvimento mobile)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Biguelini/mealflow.git
cd mealflow
```

### 2. Backend (Laravel)

```bash
cd backend

# Instalar dependências
composer install

# Copiar arquivo de ambiente
cp .env.example .env

# Gerar chave da aplicação
php artisan key:generate

# Configurar banco de dados no .env
# DB_CONNECTION=mysql
# DB_DATABASE=mealflow
# ...

# Executar migrações
php artisan migrate

# Iniciar servidor de desenvolvimento
php artisan serve
```

### 3. Web (React)

```bash
cd web

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 4. Mobile (React Native)

```bash
cd mobile

# Instalar dependências
npm install

# Iniciar Expo
npm start

# Ou para plataformas específicas:
npm run android
npm run ios
```

## 💻 Uso

### Desenvolvimento Completo

Para rodar todo o ambiente de desenvolvimento:

**Terminal 1 - Backend:**
```bash
cd backend && php artisan serve
```

**Terminal 2 - Web:**
```bash
cd web && npm run dev
```

**Terminal 3 - Mobile:**
```bash
cd mobile && npm start
```

### URLs de Desenvolvimento

| Serviço | URL |
|---------|-----|
| API Backend | http://localhost:8000 |
| Web App | http://localhost:5173 |
| Expo DevTools | http://localhost:8081 |

## 📁 Estrutura do Projeto

### Backend (`/backend`)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/    # Controladores da API
│   │   └── Middleware/     # Middlewares
│   ├── Models/             # Modelos Eloquent
│   │   ├── User.php
│   │   ├── Household.php
│   │   ├── Recipe.php
│   │   ├── Ingredient.php
│   │   ├── PantryItem.php
│   │   ├── MealPlan.php
│   │   ├── MealPlanItem.php
│   │   ├── MealType.php
│   │   ├── ShoppingList.php
│   │   └── ShoppingListItem.php
│   └── Providers/
├── database/
│   ├── migrations/         # Migrações do banco
│   └── seeders/            # Seeders
├── routes/
│   ├── api.php             # Rotas da API
│   └── web.php             # Rotas web
```

### Web (`/web`)

```
web/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── context/            # Context API (estado global)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários
│   ├── pages/              # Páginas da aplicação
│   │   ├── app/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── RecipesPage.tsx
│   │   │   ├── PantryPage.tsx
│   │   │   ├── MealPlanPage.tsx
│   │   │   ├── ShoppingListsPage.tsx
│   │   │   ├── IngredientsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── auth/
│   ├── routes/             # Configuração de rotas
│   ├── services/           # Serviços de API
│   ├── theme/              # Configuração de tema
│   └── types/              # Tipos TypeScript
└── public/                 # Arquivos estáticos
```

### Mobile (`/mobile`)

```
mobile/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── context/            # Context API
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Configuração de navegação
│   ├── screens/            # Telas da aplicação
│   │   ├── auth/
│   │   └── home/
│   ├── services/           # Serviços de API
│   └── theme/              # Configuração de tema
└── assets/                 # Imagens e recursos
```

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar novo usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário autenticado |
| POST | `/api/auth/logout` | Logout |

### Households

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/households` | Listar households |
| POST | `/api/households` | Criar household |
| POST | `/api/households/{id}/members` | Adicionar membro |

### Receitas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/recipes/search` | Buscar receitas |
| POST | `/api/recipes` | Criar receita |
| GET | `/api/recipes/{id}` | Detalhes da receita |
| PUT | `/api/recipes/{id}` | Atualizar receita |
| DELETE | `/api/recipes/{id}` | Excluir receita |

### Despensa

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/pantry/search` | Buscar itens |
| POST | `/api/pantry` | Adicionar item |
| PUT | `/api/pantry/{id}` | Atualizar item |
| DELETE | `/api/pantry/{id}` | Remover item |

### Planejamento de Refeições

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/meal-plans/search` | Buscar planejamentos |
| POST | `/api/meal-plans` | Criar planejamento |
| PUT | `/api/meal-plans/{id}` | Atualizar planejamento |

### Listas de Compras

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/shopping-lists/search` | Buscar listas |
| POST | `/api/shopping-lists/from-meal-plan/{id}` | Gerar lista do planejamento |

### Ingredientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/ingredients` | Listar ingredientes |
| POST | `/api/ingredients` | Criar ingrediente |
| GET | `/api/ingredients/{id}` | Detalhes do ingrediente |
| PUT | `/api/ingredients/{id}` | Atualizar ingrediente |
| DELETE | `/api/ingredients/{id}` | Excluir ingrediente |

### Tipos de Refeição

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/meal-types` | Listar tipos |
| POST | `/api/meal-types` | Criar tipo |
| PUT | `/api/meal-types/{id}` | Atualizar tipo |
| DELETE | `/api/meal-types/{id}` | Excluir tipo |

### Dashboard

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/dashboard/weekly-summary` | Resumo semanal |

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/Biguelini">Biguelini</a>
</p>
