# 📊 TikTok Analytics Dashboard

Outil d'analyse de performance pour créateurs de contenu TikTok.  
Connecté à une base de données en temps réel via Supabase.

## 🚀 Fonctionnalités

- **Dashboard KPIs** — vues totales, likes, partages, taux d'engagement moyen
- **Détection Flop / Hit** — séquence visuelle et moyenne de flops avant un viral
- **Analyse Momentum** — impact d'une vidéo virale sur la suivante
- **Vélocité de publication** — délai entre vidéos et impact sur les vues
- **Courbe d'évolution** — graphique Canvas custom avec ligne de moyenne
- **Insights automatiques** — analyse par casting, lieu, durée
- **Interface responsive** — compatible mobile et desktop
- **CRUD complet** — ajout, modification, suppression de vidéos (persisté en BDD)

## 🛠 Technologies

- HTML / CSS
- JavaScript
- Canvas API (graphiques custom)
- Supabase (base de données PostgreSQL + API REST)
- Google Fonts

## 💡 Contexte

Projet personnel développé pour analyser et optimiser la stratégie de contenu d'une chaîne TikTok.  
Les données sont stockées en base PostgreSQL et analysées pour détecter des patterns de performance.

## 📈 Aperçu des analyses

- Ratio Flop/Hit et séquences de publication
- Momentum post-viral
- Corrélation durée/vues, lieu/vues, casting/vues
- Score de régularité
- Vélocité et impact des pauses de publication
