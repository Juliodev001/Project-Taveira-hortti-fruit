#!/bin/bash
set -e

echo "========================================"
echo "  Setup - Sistema Horti-frutti Taveira  "
echo "========================================"

# ── Variáveis ─────────────────────────────
APP_DIR="/var/www/horti"
DB_NAME="horti"
DB_USER="horti_user"

read -rp "URL do repositório GitHub (ex: https://github.com/usuario/repo.git): " REPO_URL
read -rsp "Senha para o banco de dados PostgreSQL: " DB_PASS
echo
read -rsp "SESSION_SECRET (qualquer texto longo aleatório): " SESSION_SECRET
echo

# ── Atualizar sistema ──────────────────────
echo "[1/9] Atualizando sistema..."
apt update -y && apt upgrade -y

# ── Node.js 20 ────────────────────────────
echo "[2/9] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ── PostgreSQL ────────────────────────────
echo "[3/9] Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql <<SQL
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
SQL
echo "Banco de dados '$DB_NAME' criado."

# ── PM2 + Nginx ───────────────────────────
echo "[4/9] Instalando PM2 e Nginx..."
npm install -g pm2
apt install -y nginx

# ── Clonar repositório ────────────────────
echo "[5/9] Clonando repositório..."
mkdir -p /var/www
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

# ── Variáveis de ambiente ─────────────────
echo "[6/9] Criando arquivo .env..."
cat > "$APP_DIR/.env" <<ENV
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME?schema=public"
SESSION_SECRET="$SESSION_SECRET"
NODE_ENV="production"
ENV

# ── Dependências e build ──────────────────
echo "[7/9] Instalando dependências e fazendo build..."
cd "$APP_DIR"
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# ── PM2 ───────────────────────────────────
echo "[8/9] Configurando PM2..."
pm2 start npm --name "horti" -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ── Nginx ─────────────────────────────────
echo "[9/9] Configurando Nginx..."
cat > /etc/nginx/sites-available/horti <<NGINX
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/horti /etc/nginx/sites-enabled/horti
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "========================================"
echo "  Instalação concluída com sucesso!"
echo "  Acesse: http://$(curl -s ifconfig.me)"
echo "========================================"
