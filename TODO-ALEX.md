# TODO — Actions à faire par Alexandre

> Tout ce que Claude ne peut pas faire à ta place.
> Coche chaque case au fur et à mesure.

---

## 🔴 CRITIQUE — À faire en priorité (bloque des fonctionnalités)

### 1. Variables d'environnement Vercel
**Où :** [vercel.com](https://vercel.com) → ton projet → **Settings** → **Environment Variables**

Ajouter ces variables (Production + Preview) :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.techplay.fr` |
| `NEXT_PUBLIC_SITE_NAME` | `TechPlay` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@techplay.fr` |
| `SMTP_HOST` | ex: `smtp.gmail.com` ou celui de ton hébergeur |
| `SMTP_PORT` | `587` (ou `465` si SSL) |
| `SMTP_USER` | ton adresse email expéditeur |
| `SMTP_PASS` | mot de passe ou app password |
| `UPSTASH_REDIS_REST_URL` | (voir étape 6 ci-dessous) |
| `UPSTASH_REDIS_REST_TOKEN` | (voir étape 6 ci-dessous) |

**Impact si non fait :**
- Le robots.txt pointe sur `techplay.example.com` → mauvais pour le SEO
- Les emails (confirmation commande, newsletter) ne partent pas
- Le rate limiting tourne en mode dégradé (en mémoire au lieu de Redis)

- [ ] Variables ajoutées sur Vercel
- [ ] Redéploiement Vercel effectué après ajout (automatique si tu push, sinon bouton "Redeploy")

---

### 2. Sauvegarder les images du carousel hero
**Où :** dossier `public/carousel/` à la racine du projet

Tu m'as envoyé 4 images générées par IA. Il faut les renommer et les placer ici :

```
public/
  carousel/
    hero-1-desktop.jpg   ← setup clavier + casque
    hero-2-desktop.jpg   ← casque + souris néon hexagones
    hero-3-desktop.jpg   ← souris RGB
    hero-4-desktop.jpg   ← clavier mécanique
    hero-1-mobile.jpg    ← version recadrée verticale (environ 9:16)
    hero-2-mobile.jpg
    hero-3-mobile.jpg
    hero-4-mobile.jpg
```

**Pour les versions mobile :** recadre chaque image en format vertical (centre sur le produit).
Tu peux utiliser Canva, Photoshop, ou n'importe quel outil. Taille recommandée : 640×960 px minimum.

**Impact si non fait :** le carousel hero affiche des images de placeholder ou une erreur 404.

- [ ] Images desktop sauvegardées dans `public/carousel/`
- [ ] Images mobile créées et sauvegardées
- [ ] `git add public/carousel/ && git commit -m "feat: images carousel hero"` → `git push`

---

### 3. Marquer au moins 4 produits comme "mis en avant"
**Où :** `/admin/produits` sur ton site

La section **"Meilleures ventes"** en homepage est cachée tant qu'il n'y a pas 4 produits featured. Pour les activer :

1. Aller sur `/admin/produits`
2. Cliquer sur **"Modifier"** d'un produit
3. Cocher la case **"Mis en avant"** (ou `featured`)
4. Enregistrer
5. Répéter pour 4 produits minimum

Tu peux aussi utiliser le raccourci rapide du dashboard → bouton **"Mis en avant"** qui filtre directement les produits featured.

**Impact si non fait :** la section best-sellers n'apparaît pas sur la homepage.

- [ ] 4 produits (ou plus) marqués `featured: true`

---

## 🟠 IMPORTANT — Contenu manquant (crédibilité du site)

### 4. Remplacer les produits FakeStore par de vrais produits gaming
**Où :** `/admin/produits/nouveau`

Les produits actuels (Mens Cotton Jacket, Fjallraven Backpack, etc.) viennent de FakeStore API et cassent totalement la crédibilité d'un site gaming.

**Catégories à utiliser** (déjà traduites dans le site) :
- `casques` → casques gaming, audio
- `claviers` → claviers mécaniques, low-profile
- `souris` → souris gaming, ergonomiques
- `webcams` → webcams HD
- `audio` → enceintes, DAC
- `batteries` → power banks, hubs USB
- `ecrans` → écrans gaming 144Hz+
- `stockage` → SSD, cartes mémoire

**Pour chaque produit, remplir :**
- Titre (ex: "Casque Gaming HyperX Cloud II")
- Prix
- Description
- Image (URL ou upload)
- Catégorie (utiliser les slugs ci-dessus)
- Stock
- Cocher "Mis en avant" pour les 4+ meilleurs

- [ ] Produits FakeStore supprimés ou dépubliés
- [ ] Au moins 8-10 vrais produits gaming créés
- [ ] Au moins 4 marqués "featured"

---

### 5. Publier des articles de blog
**Où :** `/admin/blog/nouveau`

La section blog en homepage est actuellement vide. Créer au minimum 2-3 articles :

**Idées de sujets :**
- "Top 5 casques gaming 2025 : notre sélection"
- "Comment choisir sa souris gaming ? Guide complet"
- "Clavier mécanique vs membrane : lequel choisir ?"
- "Le setup gaming idéal pour moins de 300€"

**Pour chaque article :**
- Titre accrocheur
- Image de couverture (URL)
- Contenu (500-800 mots minimum)
- Cocher "Publié"

- [ ] 2 articles minimum publiés

---

## 🟡 RECOMMANDÉ — Active des fonctionnalités avancées

### 6. Créer un compte Upstash Redis (gratuit)
**Où :** [upstash.com](https://upstash.com)

Upstash est gratuit jusqu'à 10 000 requêtes/jour. Il active le **rate limiting distribué** sur tous tes endpoints critiques (checkout, contact, newsletter, etc.).

**Étapes :**
1. Créer un compte sur upstash.com
2. Créer une nouvelle base **Redis**
3. Copier `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`
4. Les coller dans Vercel (voir étape 1)

- [ ] Compte Upstash créé
- [ ] Variables Redis ajoutées sur Vercel

---

### 7. Configurer le domaine techplay.fr
**Où :** ton registrar (OVH, Namecheap, etc.) + Vercel → Settings → Domains

Si tu as acheté `techplay.fr` :
1. Sur Vercel → Settings → Domains → ajouter `www.techplay.fr`
2. Vercel te donne des enregistrements DNS à copier
3. Aller chez ton registrar → DNS → ajouter les enregistrements CNAME / A record

- [ ] Domaine pointé vers Vercel
- [ ] HTTPS actif (automatique via Vercel)
- [ ] `NEXT_PUBLIC_SITE_URL` mis à jour si pas encore fait

---

### 8. Tester les emails en production
Une fois les variables SMTP configurées :
1. Passer une commande de test sur le site
2. S'inscrire à la newsletter
3. Envoyer un message via le formulaire contact
4. Vérifier que tu reçois bien les emails

- [ ] Email de confirmation commande reçu
- [ ] Email de confirmation newsletter reçu (double opt-in)
- [ ] Message contact reçu

---

### 9. Alimenter la FAQ via l'admin (optionnel)
Actuellement la FAQ est hardcodée dans le code. Si tu veux la gérer depuis l'admin plus tard, dis-le moi et je crée une interface admin FAQ + stockage MongoDB.

- [ ] (optionnel) me demander de créer `/admin/faq`

---

## 🔵 OPTIONNEL — Vérifications et tests

### 10. Tester les scores PageSpeed
**Où :** [pagespeed.web.dev](https://pagespeed.web.dev)

Entrer l'URL de ton site Vercel → tester sur mobile ET desktop.
Objectifs : Performance > 90, SEO > 95, Accessibility > 95.

- [ ] Scores vérifiés
- [ ] Résultats partagés avec Claude si optimisations nécessaires

---

### 11. Créer des images OG par langue (partage réseaux sociaux)
**Où :** `public/og-image-fr.jpg` et `public/og-image-en.jpg`

Image de 1200×630 px avec le logo TechPlay + tagline.
Utilisée quand quelqu'un partage le site sur Facebook, Discord, WhatsApp.

- [ ] `/og-image-fr.jpg` créée (1200×630 px)
- [ ] `/og-image-en.jpg` créée (1200×630 px)
- [ ] `git push` pour les déployer

---

## Résumé — Par ordre d'urgence

| # | Action | Temps | Impact |
|---|--------|-------|--------|
| 1 | Variables env Vercel | 15 min | 🔴 SEO + emails cassés |
| 2 | Images carousel `public/carousel/` | 10 min | 🔴 Hero carousel vide |
| 3 | 4 produits marqués featured | 5 min | 🔴 Section best-sellers cachée |
| 4 | Vrais produits gaming | 1-2h | 🟠 Crédibilité totale |
| 5 | 2-3 articles blog | 1-2h | 🟠 Section blog vide |
| 6 | Compte Upstash Redis | 10 min | 🟡 Rate limiting prod |
| 7 | Domaine techplay.fr | 30 min | 🟡 URL pro |
| 8 | Test emails production | 15 min | 🟡 Vérification |
| 9 | PageSpeed test | 10 min | 🔵 Optimisation |
| 10 | Images OG sociales | 20 min | 🔵 Partage réseaux |

---

*Document généré le 29/04/2026 — à mettre à jour au fur et à mesure*
