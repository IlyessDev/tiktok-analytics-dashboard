/**
 * utils.js
 * Fonctions utilitaires partagées entre tous les modules
 */

/**
 * Formate un nombre en format lisible (1.2k, 3.4M)
 */
export function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/**
 * Calcule le taux d'engagement d'une vidéo
 */
export function engRate(v) {
  return v.Vues ? ((v.Likes + v.Partages) / v.Vues * 100) : 0;
}

/**
 * Retourne la classe CSS selon le nombre de vues
 */
export function viralClass(vues) {
  return vues >= 50000 ? 'viral' : vues >= 10000 ? 'medium' : 'low';
}

/**
 * Retourne le badge HTML pour le casting
 */
export function badgeCasting(c) {
  const m = { solo: 'badge-solo', duo: 'badge-duo', groupe: 'badge-groupe' };
  return `<span class="badge ${m[c] || ''}">${c}</span>`;
}

/**
 * Retourne le badge HTML pour le lieu
 */
export function badgeLieu(l) {
  const m = { 'intérieur': 'badge-interieur', 'extérieur': 'badge-exterieur', 'studio': 'badge-studio' };
  return `<span class="badge ${m[l] || ''}">${l}</span>`;
}

/**
 * Affiche un toast de notification
 */
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

/**
 * Met à jour le compteur de vidéos dans le header
 */
export function updateHeaderCount(count) {
  document.getElementById('header-count').textContent =
    count + ' vidéo' + (count > 1 ? 's' : '');
}
