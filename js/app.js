/**
 * app.js
 * Point d'entrée de l'application
 * Initialisation, navigation, chargement des données
 */

import { fetchVideos, login } from './api.js';
import { renderDashboard } from './dashboard.js';
import { renderVideos, addVideo, saveEdit, closeModal } from './videos.js';
import { toast } from './utils.js';

// ── ÉTAT GLOBAL ──
let videos = [];
let currentPage = 'dashboard';

// ── AUTH ──
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

window.openLoginModal = function(reason) {
  const msg = document.getElementById('login-message');
  if (reason === 'add')         msg.textContent = '⚠ Vous devez vous authentifier pour ajouter une vidéo.';
  else if (reason === 'edit')   msg.textContent = '⚠ Vous devez vous authentifier pour modifier une vidéo.';
  else if (reason === 'delete') msg.textContent = '⚠ Vous devez vous authentifier pour supprimer une vidéo.';
  else msg.textContent = '';
  document.getElementById('login-modal').classList.add('active');
};

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

function updateNavLogin() {
  const btn = document.getElementById('btn-nav-login');
  if (isLoggedIn()) {
    btn.textContent = '✓ Connecté';
    btn.style.color = '#4ade80';
  } else {
    btn.textContent = '🔐 Se connecter';
    btn.style.color = '';
  }
}

// ── LOGIN EVENTS ──
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const data = await login(email, password);
  if (data.access_token) {
    closeLoginModal();
    updateNavLogin();
    toast('✓ Connecté !');
  } else {
    toast('⚠ Email ou mot de passe incorrect');
  }
});
document.getElementById('btn-close-login').addEventListener('click', closeLoginModal);
document.getElementById('login-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('login-modal')) closeLoginModal();
});

// ── NAVIGATION ──
window.showPage = function(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[['dashboard', 'videos', 'add'].indexOf(name)].classList.add('active');
  currentPage = name;

  if (name === 'dashboard') renderDashboard(videos);
  if (name === 'videos')    renderVideos(videos);
};

// ── CHARGEMENT DES DONNÉES ──
async function loadData() {
  showLoading(true);
  videos = await fetchVideos();
  showLoading(false);

  if (currentPage === 'dashboard') renderDashboard(videos);
  if (currentPage === 'videos')    renderVideos(videos);
}

// ── RECHARGEMENT (appelé après ajout/modif/suppression) ──
window.reloadVideos = async function() {
  await loadData();
  window.showPage(currentPage);
};

// ── FORMULAIRE AJOUT ──
document.getElementById('btn-add').addEventListener('click', () => {
  if (!isLoggedIn()) return openLoginModal('add');
  addVideo(async () => {
    await loadData();
    window.showPage('dashboard');
  });
});

// ── MODALE ÉDITION ──
document.getElementById('btn-save-edit').addEventListener('click', () => {
  saveEdit(() => loadData());
});
document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('edit-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('edit-modal')) closeModal();
});

// ── FILTRES VIDÉOS ──
document.getElementById('filter-casting').addEventListener('change', () => renderVideos(videos));
document.getElementById('filter-lieu').addEventListener('change',    () => renderVideos(videos));
document.getElementById('filter-sort').addEventListener('change',    () => renderVideos(videos));

// ── HELPERS ──
function showLoading(show) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = show ? 'block' : 'none';
}

// ── INIT ──
document.getElementById('f-date').valueAsDate = new Date();
updateNavLogin();
loadData();
