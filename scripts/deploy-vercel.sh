#!/usr/bin/env bash
set -Eeuo pipefail

# Publica o projeto na Vercel sem armazenar credenciais no repositório.
# Uso:
#   ./scripts/deploy-vercel.sh --check   # valida sem publicar
#   ./scripts/deploy-vercel.sh           # publica em produção
#
# Pré-requisitos:
#   - Node.js e pnpm instalados
#   - Vercel CLI: npm i -g vercel
#   - Login: vercel login
#   - Variáveis exportadas no shell:
#       VITE_SUPABASE_URL
#       VITE_SUPABASE_ANON_KEY
#       SUPABASE_SERVICE_ROLE_KEY
#       DATABASE_URL
#       JWT_SECRET
#       VITE_APP_ID
#       OAUTH_SERVER_URL
#       OWNER_OPEN_ID

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECK_ONLY=false

if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=true
elif [[ "${1:-}" != "" ]]; then
  echo "Uso: $0 [--check]" >&2
  exit 2
fi

cd "$ROOT_DIR"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI não encontrada. Instale com: npm install --global vercel" >&2
  exit 1
fi

required_vars=(
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  DATABASE_URL
  JWT_SECRET
  VITE_APP_ID
  OAUTH_SERVER_URL
  OWNER_OPEN_ID
)

missing=()
for name in "${required_vars[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
  fi
done

if ((${#missing[@]} > 0)); then
  printf 'Variáveis ausentes: %s\n' "${missing[*]}" >&2
  echo "Exporte-as no terminal ou configure-as no painel da Vercel. Não coloque valores em arquivos versionados." >&2
  exit 1
fi

if [[ ! -f package.json ]]; then
  echo "package.json não encontrado; execute o script na raiz do projeto." >&2
  exit 1
fi

if [[ "${ALLOW_DIRTY_TREE:-0}" != "1" ]] && [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree contém alterações não commitadas. Faça commit ou use ALLOW_DIRTY_TREE=1." >&2
  git status --short >&2
  exit 1
fi

echo "==> Instalando dependências"
pnpm install --frozen-lockfile

echo "==> Validando TypeScript"
pnpm check

echo "==> Executando testes"
pnpm test

echo "==> Gerando build"
pnpm build

if [[ "$CHECK_ONLY" == "true" ]]; then
  echo "Validação concluída. Nenhuma publicação foi feita (--check)."
  exit 0
fi

echo "==> Publicando na Vercel"
# O CLI usa a conta já autenticada e abre a configuração do projeto na primeira execução.
# As variáveis não são passadas na linha de comando para não aparecerem no histórico.
vercel deploy --prod

echo "Publicação concluída. Verifique a URL exibida pela Vercel acima."
