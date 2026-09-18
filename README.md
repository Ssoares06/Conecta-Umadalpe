# Conecta UMADALPE

> Acolhimento e união. Jovens com propósito. Permanecer conectado.

Ferramenta de recepção para cultos da UMADALPE de Maranguape II Baixo: check-in de UMADALPEs visitantes e painel de projeção com os totais de chegada em tempo real.

## Stack

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS) → Cloudflare Pages
- **Backend:** Cloudflare Workers (Hono) → API REST
- **Banco de dados:** Cloudflare D1 (SQLite)
- **Cache / rate limit:** Cloudflare KV
- **Tempo real:** Cloudflare Durable Objects (SSE) — usado pelo painel da TV

## Estrutura do projeto

```
conecta-umadalpe/
├── workers/            # API (Cloudflare Workers + Hono + D1 + Durable Objects)
│   └── src/
│       ├── index.ts        # Rotas da API
│       ├── realtimeRoom.ts # Durable Object (SSE)
│       ├── helpers.ts       # Rate limit, sanitização, auth admin
│       └── types.ts
├── frontend/           # Next.js (App Router)
│   └── app/
│       ├── page.tsx          # Entrada: check-in ou painel do culto
│       ├── checkin/          # Check-in da UMADALPE visitante + card digital
│       ├── culto/            # Painel para TV/projetor durante o culto
│       └── admin/            # Consulta dos registros e exportação CSV
└── schema.sql          # Schema do banco D1
```

## 1. Configurar o backend (Cloudflare Workers + D1)

```bash
cd workers
npm install

# Login na Cloudflare (abre o navegador)
npx wrangler login

# Criar o banco D1
npm run db:create
# → copie o "database_id" retornado e cole em workers/wrangler.toml

# Criar o namespace KV (rate limiting/cache)
npx wrangler kv namespace create CACHE
# → copie o "id" retornado e cole em workers/wrangler.toml

# Rodar as migrations (schema.sql) no banco remoto
npm run db:migrate:remote

# (opcional) testar localmente
npm run db:migrate:local
npm run dev   # sobe em http://localhost:8787

# Deploy em produção
npm run deploy
```

Após o deploy, o Wrangler mostra a URL do seu Worker, algo como:
`https://conecta-umadalpe-api.<seu-usuario>.workers.dev`

**Importante:** troque o `admin_token` padrão. No painel D1 (ou via `wrangler d1 execute`), rode:

```sql
UPDATE settings SET value = 'seu-token-secreto-aqui' WHERE key = 'admin_token';
```

Esse token é o que a liderança vai usar para entrar em `/admin`.

## 2. Configurar o frontend (Next.js → Cloudflare Pages)

```bash
cd frontend
npm install
cp .env.example .env.local
# edite .env.local e coloque a URL do Worker publicada no passo 1:
# NEXT_PUBLIC_API_URL=https://conecta-umadalpe-api.<seu-usuario>.workers.dev

npm run dev   # testar localmente em http://localhost:3000
```

### Deploy no Cloudflare Pages

```bash
npm install
npm run pages:deploy
```

Isso usa `@cloudflare/next-on-pages` para publicar o site em Cloudflare Pages. Na primeira execução, o Wrangler vai pedir para criar o projeto Pages — aceite o nome sugerido (`conecta-umadalpe`) ou escolha outro.

**Não conecte este repositório a um projeto do tipo Worker Builds.** O repositório tem dois aplicativos, em pastas diferentes: `frontend` é um Pages e `workers` é a API. A conexão Git automática feita na raiz cria um terceiro projeto (`conecta-umadalpe`) e falha porque não existe `package.json` na raiz. Use os dois deploys acima/abaixo, ou configure separadamente o diretório raiz correto em cada projeto.

Depois do deploy, configure a variável de ambiente `NEXT_PUBLIC_API_URL` também no painel do Cloudflare Pages (Settings → Environment variables), apontando para a URL do Worker, para que o build de produção use o valor correto.

Por fim, edite `workers/wrangler.toml` e troque `CORS_ORIGIN = "*"` pelo domínio final do seu Pages (ex: `https://conecta-umadalpe.pages.dev`), e rode `npm run deploy` de novo no Worker.

## 3. Acessar o painel administrativo

Acesse `/admin` no site publicado e entre com o token configurado no passo 1. No painel você pode:

- Ver estatísticas em tempo real e a lista de caravanas (com exportação em CSV)
- Ver e gerenciar pedidos de oração, marcar como "orado" e ativar o **modo intercessão** na TV
- Atualizar o versículo do dia e outros conteúdos

## 4. Painel da TV

Abra `/tv` em um navegador conectado à TV do templo (modo tela cheia — pressione F11). A tela atualiza sozinha em tempo real via SSE: contadores, mosaico da adoração e modo intercessão quando ativado pelo admin.

## 5. Gerar o QR Code de acesso

Depois de publicar o frontend, gere um QR Code apontando para a URL pública (ex: `https://conecta-umadalpe.pages.dev`) usando qualquer gerador, por exemplo:

```bash
npx qrcode-terminal "https://conecta-umadalpe.pages.dev"
# ou, para gerar um arquivo PNG:
npx qrcode "https://conecta-umadalpe.pages.dev" -o qrcode.png
```

Imprima o QR Code e distribua na entrada do templo.

## Segurança implementada

- Sanitização de todos os campos de texto recebidos do público (remoção de tags HTML)
- Rate limiting por IP nos endpoints públicos (`/api/checkin`, `/api/prayer`, `/api/contact`, `/api/mosaic/add`)
- Autenticação por token no painel admin (`Authorization: Bearer <token>`), validado contra o banco D1
- Modo de manutenção configurável (bloqueia rotas públicas da API com HTTP 503)

## Próximos passos sugeridos

- Trocar o token de admin padrão antes do evento
- Popular a tabela `agenda_items` e `edification_words` pelo painel ou via SQL
- Testar o painel da TV em uma tela real antes do evento (contraste, tamanho de fonte)
