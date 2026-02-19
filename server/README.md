# Birthday RSVP Server

Backend para confirmação de presença em aniversário.

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```bash
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/birthday.db
ADMIN_PASSWORD=seu-senha-aqui
JWT_SECRET=seu-secret-jwt-aqui
CORS_ORIGIN=http://localhost:5173
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Produção

```bash
npm run build
npm start
```

## Endpoints

### Public

- `POST /api/rsvp` - Salvar confirmação
- `POST /api/admin/login` - Login administrativo

### Protected (requer JWT token)

- `GET /api/rsvp` - Listar todas as confirmações
- `GET /api/statistics` - Obter estatísticas
- `GET /api/admin/export` - Exportar CSV
- `DELETE /api/admin/rsvp` - Deletar todos os dados

## Estrutura de Dados

### RSVP Request

```json
{
  "responsibleName": "João Silva",
  "confirmation": "sim",
  "participants": [
    {
      "name": "João Silva",
      "age": 35
    },
    {
      "name": "Maria Silva",
      "age": 32
    },
    {
      "name": "Pedro Silva",
      "age": 5
    }
  ],
  "totalPeople": 3
}
```

### Admin Login Request

```json
{
  "password": "seu-senha-aqui"
}
```

### Admin Login Response

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
