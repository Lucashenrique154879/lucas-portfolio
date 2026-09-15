# Publicação

O script `deploy-vercel.sh` valida o projeto e publica na Vercel.

## Preparação

1. Instale a CLI e autentique a conta:

```bash
npm install --global vercel
vercel login
```

2. Exporte as variáveis necessárias no terminal ou configure-as no projeto da Vercel. Nunca salve esses valores em `.env` versionado nem os inclua em comandos registrados no histórico.

```bash
export VITE_SUPABASE_URL="..."
export VITE_SUPABASE_ANON_KEY="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
export DATABASE_URL="..."
export JWT_SECRET="..."
export VITE_APP_ID="..."
export OAUTH_SERVER_URL="..."
export OWNER_OPEN_ID="..."
```

3. Valide sem publicar:

```bash
./scripts/deploy-vercel.sh --check
```

4. Publique em produção:

```bash
./scripts/deploy-vercel.sh
```

O script interrompe se houver alterações não commitadas, variáveis ausentes, falha no TypeScript, testes falhando ou erro no build. Para uma execução deliberadamente feita com alterações locais, use `ALLOW_DIRTY_TREE=1 ./scripts/deploy-vercel.sh`.
