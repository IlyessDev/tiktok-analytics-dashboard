import { fetchVideos } from './api.js';
import { renderDashboard } from './dashboard.js';
import { renderVideos, addVideo, saveEdit, closeModal } from './videos.js';

// ── ÉTAT GLOBAL — les vidéos chargées depuis Supabase
let videos = [];
let currentPage = 'dashboard';

// ── NAVIGATION — change de page et affiche le bon contenu
window.showPage = function(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn')[['dashboard', 'videos', 'add'].indexOf(name)].classList.add('active');
  currentPage = name;

  if (name === 'dashboard') renderDashboard(videos);
  if (name === 'videos')    renderVideos(videos);
};

// ── CHARGEMENT — va chercher les vidéos dans Supabase et rafraîchit l'affichage
function loadData() {
  document.getElementById('loader').style.display = 'block';
  fetchVideos()
    .then(data => {
      videos = data;
      document.getElementById('loader').style.display = 'none';
      if (currentPage === 'dashboard') renderDashboard(videos);
      if (currentPage === 'videos')    renderVideos(videos);
    })
}

// ── RECHARGEMENT — appelé après ajout, modif ou suppression
window.reloadVideos = function() {
  loadData();
}

// ── BOUTONS
document.getElementById('btn-add').addEventListener('click', () => {
  addVideo(() => loadData());
});

document.getElementById('btn-save-edit').addEventListener('click', () => {
  saveEdit(() => loadData());
});

document.getElementById('btn-close-modal').addEventListener('click', closeModal);

document.getElementById('edit-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('edit-modal')) closeModal();
});

// ── FILTRES
document.getElementById('filter-casting').addEventListener('change', () => renderVideos(videos));
document.getElementById('filter-lieu').addEventListener('change',    () => renderVideos(videos));
document.getElementById('filter-sort').addEventListener('change',    () => renderVideos(videos));

// ── INIT — date du jour + chargement au démarrage
document.getElementById('f-date').valueAsDate = new Date();
loadData();
