# Guide de Déploiement Production - EntrepriseOS 🚀

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Environnement](#configuration-environnement)
3. [Déploiement Vercel](#déploiement-vercel)
4. [Déploiement Docker](#déploiement-docker)
5. [Configuration DNS](#configuration-dns)
6. [SSL/HTTPS](#sslhttps)
7. [Monitoring](#monitoring)
8. [Backup & Recovery](#backup--recovery)
9. [Checklist Go-Live](#checklist-go-live)

## 🔧 Prérequis

### Infrastructure minimale
- **Serveur**: 4 vCPU, 8GB RAM, 100GB SSD
- **OS**: Ubuntu 22.04 LTS ou Debian 11
- **Docker**: v24.0+
- **Node.js**: v20.0+ (pour build local)
- **Domaine**: app.enterpriseos.com configuré

### Services externes requis
- ✅ Supabase (déjà configuré)
- 🔑 Clés API IA (OpenAI, Google AI, Anthropic)
- 📧 Service SMTP (SendGrid recommandé)
- 💳 Stripe (pour paiements)
- 📊 Analytics (PostHog, Sentry)

## 📝 Configuration Environnement

### 1. Copier et configurer les variables

```bash
# Copier le template
cp .env.example .env.production

# Éditer avec vos vraies valeurs
nano .env.production
```

### 2. Variables critiques à configurer

```env
# 🔐 Supabase (DÉJÀ FOURNI)
NEXT_PUBLIC_SUPABASE_URL=https://kdwjbqhdpthbtqpphkid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 🤖 IA Services
OPENAI_API_KEY=sk-proj-xxxxx
GOOGLE_AI_API_KEY=AIzaSyxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 📧 Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PASSWORD=SG.xxxxx

# 🔒 Security
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# 📊 Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## 🚀 Déploiement Vercel (Recommandé)

### 1. Installation Vercel CLI

```bash
npm i -g vercel
```

### 2. Connexion et configuration

```bash
# Se connecter
vercel login

# Lier le projet
vercel link

# Configurer les variables d'environnement
vercel env pull .env.production
```

### 3. Déploiement

```bash
# Déploiement production
vercel --prod

# Ou avec le script
npm run deploy:production
```

### 4. Configuration dans Vercel Dashboard

1. **Domaine personnalisé**
   - Aller dans Settings > Domains
   - Ajouter `app.enterpriseos.com`
   - Configurer les DNS

2. **Variables d'environnement**
   - Settings > Environment Variables
   - Ajouter toutes les variables de `.env.production`
   - Sélectionner "Production" uniquement

3. **Régions**
   - Settings > Functions > Region
   - Sélectionner `cdg1` (Paris)

## 🐳 Déploiement Docker

### 1. Préparer le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com | sh

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Créer utilisateur
sudo useradd -m -s /bin/bash enterpriseos
sudo usermod -aG docker enterpriseos
```

### 2. Cloner et configurer

```bash
# Se connecter en tant qu'utilisateur
su - enterpriseos

# Cloner le repo
git clone https://github.com/your-org/enterpriseos.git
cd enterpriseos

# Copier les fichiers de configuration
cp .env.example .env.production
# Éditer avec vos valeurs
```

### 3. Lancer le déploiement

```bash
# Utiliser le script automatisé
./scripts/deploy-production.sh

# Ou manuellement
docker-compose -f docker-compose.production.yml up -d
```

## 🌐 Configuration DNS

### Records DNS requis

```dns
# A Records
app.enterpriseos.com    A    1.2.3.4
www.enterpriseos.com    A    1.2.3.4

# CNAME (si CDN)
cdn.enterpriseos.com    CNAME    xxxxx.cloudfront.net

# MX Records (pour emails)
@    MX    10    mail.enterpriseos.com

# TXT Records
@    TXT    "v=spf1 include:sendgrid.net ~all"
_dmarc    TXT    "v=DMARC1; p=quarantine"
```

## 🔒 SSL/HTTPS

### Option 1: Let's Encrypt (Gratuit)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Générer certificat
sudo certbot --nginx -d app.enterpriseos.com -d www.enterpriseos.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

### Option 2: Cloudflare (Recommandé)

1. Ajouter le site dans Cloudflare
2. Activer "Full (strict)" SSL
3. Activer "Always Use HTTPS"
4. Configurer les Page Rules

## 📊 Monitoring

### 1. Accès aux dashboards

- **Grafana**: https://app.enterpriseos.com:3001
  - User: admin
  - Pass: (défini dans docker-compose)

- **Prometheus**: https://app.enterpriseos.com:9090

### 2. Alertes critiques

```yaml
# monitoring/alerts.yml
groups:
  - name: enterpriseos
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations:
          summary: "Taux d'erreur élevé"
          
      - alert: HighMemoryUsage
        expr: memory_usage_percent > 90
        annotations:
          summary: "Utilisation mémoire critique"
```

### 3. Logs centralisés

```bash
# Voir les logs en temps réel
docker logs -f enterpriseos-app

# Logs Nginx
docker logs -f enterpriseos-nginx

# Tous les logs
docker-compose -f docker-compose.production.yml logs -f
```

## 💾 Backup & Recovery

### 1. Backup automatique

Le service de backup est configuré pour :
- Backup quotidien à 2h du matin
- Rétention de 30 jours
- Upload vers S3

### 2. Backup manuel

```bash
# Backup complet
./scripts/backup.sh

# Backup Supabase (données)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### 3. Restauration

```bash
# Restaurer depuis S3
aws s3 cp s3://enterpriseos-backups/latest.tar.gz .
tar -xzf latest.tar.gz

# Restaurer base de données
psql $DATABASE_URL < backup.sql
```

## ✅ Checklist Go-Live

### Avant le déploiement

- [ ] **Tests**
  ```bash
  npm run test:all
  npm run test:e2e:production
  ```

- [ ] **Performance**
  ```bash
  npm run lighthouse
  # Score > 95 requis
  ```

- [ ] **Sécurité**
  ```bash
  npm audit
  npm run security:check
  ```

- [ ] **Build production**
  ```bash
  npm run build
  # Aucune erreur TypeScript
  ```

### Configuration production

- [ ] Variables d'environnement configurées
- [ ] Clés API production actives
- [ ] Domaine DNS configuré
- [ ] SSL/HTTPS activé
- [ ] CDN configuré
- [ ] Emails transactionnels testés

### Monitoring

- [ ] Sentry configuré et testé
- [ ] PostHog analytics actif
- [ ] Grafana dashboards configurés
- [ ] Alertes email/SMS actives
- [ ] Logs centralisés

### Sécurité

- [ ] RLS Supabase validé
- [ ] 2FA activé pour admins
- [ ] Rate limiting configuré
- [ ] CORS restrictif
- [ ] Headers sécurité (CSP, HSTS)
- [ ] Backup automatique testé

### Performance

- [ ] Lighthouse score > 95
- [ ] Time to First Byte < 200ms
- [ ] Core Web Vitals green
- [ ] Images optimisées (WebP)
- [ ] JS bundle < 500KB

### Documentation

- [ ] README.md à jour
- [ ] API documentation
- [ ] Guide utilisateur
- [ ] Runbook ops

## 🚨 Rollback Procedure

En cas de problème :

```bash
# 1. Arrêter le déploiement actuel
docker-compose -f docker-compose.production.yml down

# 2. Restaurer la version précédente
docker pull $DOCKER_REGISTRY/enterpriseos:previous
docker tag $DOCKER_REGISTRY/enterpriseos:previous enterpriseos:latest

# 3. Redémarrer
docker-compose -f docker-compose.production.yml up -d

# 4. Vérifier
curl https://app.enterpriseos.com/api/health
```

## 📞 Support & Contacts

### Urgences production
- **Email**: ops@enterpriseos.com
- **Slack**: #production-alerts
- **Phone**: +33 6 XX XX XX XX (on-call)

### Escalation
1. DevOps Engineer on-call
2. Lead Developer
3. CTO

---

## 🎉 Post-Déploiement

### Vérifications finales

```bash
# 1. Test de charge
artillery run tests/load-test.yml

# 2. Test utilisateur
- Créer un compte
- Se connecter
- Créer un projet
- Générer une facture
- Tester l'IA

# 3. Monitoring 24h
- Vérifier les métriques
- Analyser les logs
- Corriger les erreurs
```

### Communication

1. **Email aux utilisateurs**
   - Nouvelles fonctionnalités
   - Guide de migration

2. **Réseaux sociaux**
   - Annonce du lancement
   - Demo video

3. **Documentation**
   - Changelog
   - Notes de version

---

**🚀 EntrepriseOS est maintenant en production !**

Pour toute question : contact@enterpriseos.com