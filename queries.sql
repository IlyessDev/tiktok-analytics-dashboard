--  TikTok Analytics Dashboard — Requêtes SQL
--  Base de données : Supabase (PostgreSQL)
--  Table principale : videos
--  Colonnes : id, Titre, Casting, Lieu, Duree, Date, Vues, Likes, Partages, Notes

-- 1.1 Toutes les vidéos triées par vues décroissantes
SELECT *
FROM videos
ORDER BY "Vues" DESC

-- 1.2 Statistiques globales
SELECT
  COUNT(*) AS nb_videos,
  SUM("Vues") AS total_vues,
  SUM("Likes") AS total_likes,
  SUM("Partages") AS total_partages,
  ROUND(AVG("Vues")) AS moyenne_vues,
  ROUND(AVG("Likes")) AS moyenne_likes,
  ROUND(AVG("Partages")) AS moyenne_partages
FROM videos

-- 1.3 Nombre de vidéos par casting
SELECT "Casting",COUNT(*) AS nb_videos
FROM videos
GROUP BY "Casting";

-- 1.4 Meilleur casting par moyenne de vues
SELECT "Casting", COUNT(*) AS nb_videos, ROUND(AVG("Vues")) AS moyenne_vues
FROM videos
GROUP BY "Casting"
ORDER BY AVG("Vues") DESC;

-- 2.1 Taux d'engagement par vidéo
SELECT "Titre", "Vues", "Likes", "Partages",
  ROUND(
    CASE 
    WHEN "Vues" = 0 THEN 0
    ELSE ("Likes" + "Partages")::float / "Vues" * 100
    END , 2) AS taux_engagement
FROM videos
ORDER BY taux_engagement DESC;

-- 2.2 Catégorisation des vidéos (Hit / Moyen / Flop)
SELECT "Titre", "Vues",
  CASE
    WHEN "Vues" >= 50000 THEN 'Hit'
    WHEN "Vues" <  15000 THEN 'Flop'
    ELSE 'Moyen'
  END AS performance
FROM videos
ORDER BY "Vues" DESC;

-- 2.3 Comptage et moyenne par catégorie de performance
SELECT performance, COUNT(*) AS nb_videos, ROUND(AVG("Vues")) AS moyenne_vues
FROM (
  SELECT "Vues",
    CASE
      WHEN "Vues" >= 50000 THEN 'Hit'
      WHEN "Vues" <  15000 THEN 'Flop'
      ELSE                      'Moyen'
    END AS performance
  FROM videos
) AS videos_categorisees
GROUP BY performance
ORDER BY moyenne_vues DESC;


-- 2.4 Catégorie durée (< 20s / 20-40s / 40-60s / > 60s)
SELECT "Titre", "Duree",
  CASE
    WHEN "Duree" < 20 THEN '< 20s'
    WHEN "Duree" < 40 THEN '20-40s'
    WHEN "Duree" < 60 THEN '40-60s'
    ELSE '> 60s'
  END AS duree_cat
FROM videos;

-- 3.1 Stats par casting avec taux d'engagement moyen
WITH stats_casting AS (
  SELECT "Casting", COUNT(*) AS nb_videos, ROUND(AVG("Vues")) AS moyenne_vues,
    ROUND(
      (AVG("Likes") + AVG("Partages")) / AVG("Vues") * 100
    , 2) AS engagement_moyen
  FROM videos
  GROUP BY "Casting"
),
top_casting AS (
  SELECT *
  FROM stats_casting
  WHERE moyenne_vues > 20000
)
SELECT * FROM top_casting
ORDER BY moyenne_vues DESC;

-- 3.2 Toutes les vidéos avec rang global + moyenne du casting + écart
WITH video_stats AS (
  SELECT "Titre", "Date", "Casting", "Vues",
    ROUND(AVG("Vues") OVER (PARTITION BY "Casting")) AS moy_casting,
    RANK() OVER (ORDER BY "Vues" DESC) AS rang_global
  FROM videos
)
SELECT "Titre", "Date", "Casting", "Vues", moy_casting, rang_global,
  ABS("Vues" - moy_casting) AS ecart_moyenne
FROM video_stats
ORDER BY rang_global;

-- 4.1 Rang par vues - global et par casting
SELECT "Titre", "Casting", "Vues", RANK() OVER (ORDER BY "Vues" DESC) AS rang_global,
  RANK() OVER (PARTITION BY "Casting" ORDER BY "Vues" DESC) AS rang_dans_casting
FROM videos;

-- 4.2 Momentum - évolution des vues par rapport à la vidéo précédente
WITH videos_ordered AS (
  SELECT "Titre", "Date", "Vues", LAG("Vues") OVER (ORDER BY "Date") AS vues_precedente
  FROM videos
)
SELECT "Titre", "Date", "Vues", vues_precedente,
  ROUND(
    ("Vues" - vues_precedente)::float
    / vues_precedente * 100
  , 1) AS evolution_pct
FROM videos_ordered
WHERE vues_precedente IS NOT NULL
ORDER BY "Date";

-- 4.3 Flops consécutifs avant chaque hit
WITH videos_classees AS ( 
  SELECT "Titre", "Date", "Vues", ROW_NUMBER() OVER (ORDER BY "Date") AS numero,
    CASE
      WHEN "Vues" >= 50000 THEN 'hit'
      WHEN "Vues" <  15000 THEN 'flop'
      ELSE 'moyen'
    END AS categorie
  FROM videos
),
hits_avec_precedent AS (
  SELECT "Titre", "Vues", numero, LAG(numero) OVER (ORDER BY numero) AS numero_hit_precedent
  FROM videos_classees
  WHERE categorie = 'hit'
)
SELECT h."Titre", h."Vues", h.numero,
  COUNT(*) FILTER (
    WHERE f.categorie = 'flop'
  ) AS flops_consecutifs_avant
FROM hits_avec_precedent h
LEFT JOIN videos_classees f
  ON  f.numero > COALESCE(h.numero_hit_precedent, 0)
  AND f.numero < h.numero
GROUP BY h."Titre", h."Vues", h.numero
ORDER BY h.numero;


-- 4.4 délai entre chaque vidéo
SELECT "Titre", "Date", "Vues", LAG("Date") OVER (ORDER BY "Date") AS date_precedente,
  ("Date" - LAG("Date") OVER (ORDER BY "Date")) AS delai,
  CASE
    WHEN ("Date" - LAG("Date") OVER (ORDER BY "Date")) >= 25  THEN 'Longue pause'
    WHEN ("Date" - LAG("Date") OVER (ORDER BY "Date")) >= 14  THEN 'Pause'
    ELSE 'Régulier'
  END AS type_delai
FROM videos
ORDER BY "Date";


WITH base AS (
  SELECT "Titre", "Casting", "Lieu", "Duree", "Date", "Vues", "Likes", "Partages",
    ROW_NUMBER() OVER (ORDER BY "Date") AS numero,
    RANK() OVER (ORDER BY "Vues" DESC) AS rang_global,
    LAG("Vues") OVER (ORDER BY "Date") AS vues_precedente,
    ROUND(AVG("Vues") OVER (PARTITION BY "Casting")) AS moy_casting,
    CASE
      WHEN "Vues" >= 50000 THEN 'Hit'
      WHEN "Vues" <  15000 THEN 'Flop'
      ELSE 'Moyen'
    END AS performance
  FROM videos
)
SELECT "Titre", "Casting", "Lieu", "Date", "Vues", rang_global, performance, moy_casting, 
  ABS("Vues" - moy_casting) AS ecart_moyenne,
  ROUND(
    ("Likes" + "Partages")::float / NULLIF("Vues", 0) * 100
  , 2) AS taux_engagement,
  ROUND(
    ("Vues" - vues_precedente)::float
    / NULLIF(vues_precedente, 0) * 100
  , 1) AS evolution_vs_precedente
FROM base
ORDER BY rang_global;
