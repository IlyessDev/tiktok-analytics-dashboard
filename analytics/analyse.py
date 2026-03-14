import requests
import pandas as pd
import matplotlib.pyplot as plt

# Connexion bdd
URL = "https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos?select=*"
API_KEY = "sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq"

headers = {
    "apikey": API_KEY,
    "Authorization": "Bearer " + API_KEY
}

response = requests.get(URL, headers=headers)
df = pd.DataFrame(response.json())

df['Date'] = pd.to_datetime(df['Date'])


# Calcul du taux d'engagement comme dans le dashboard js
df["taux_engagement"] = (
    (df["Likes"] + df["Partages"]) / df["Vues"] * 100
).round(2)


# Categoriser les durée
def categorise_duree(d):
    if d < 20:   
      return "< 20s"
    elif d < 40: 
      return "20-40s"
    elif d < 60: 
      return "40-60s"
    else: 
      return "> 60s"

df["duree_cat"] = df["Duree"].apply(categorise_duree)

# Categoriser les performances
def categorise_perf(v):
    if v >= 50000:  
      return "Hit"
    elif v < 15000: 
      return "Flop"
    else: 
      return "Moyen"

df["performance"] = df["Vues"].apply(categorise_perf)

print(df[["Titre", "Vues", "taux_engagement", "duree_cat", "performance"]].to_string())

# Savoir ce qui performe le mieux entre solo, duo ou groupe
moy_casting = df.groupby("Casting").agg(
    nb_videos = ("Vues", "count"),
    moyenne_vues  = ("Vues", "mean"),
    engagement_moyen = ("taux_engagement", "mean")
).round(2).sort_values("moyenne_vues", ascending=False)

print(moy_casting)

# Savoir quel lieu performe le mieux
moy_lieu = df.groupby("Lieu").agg(
    nb_videos = ("Vues", "count"),
    moyenne_vues = ("Vues", "mean")
).round(2).sort_values("moyenne_vues", ascending=False)

print(moy_lieu)

# Moyenne par durée
moy_duree = df.groupby("duree_cat").agg(
    nb_videos = ("Vues", "count"),
    moyenne_vues = ("Vues", "mean")
).round(2).sort_values("moyenne_vues", ascending=False)

print(moy_duree)


plt.rcParams["figure.facecolor"] = "#f5f0e8" 
plt.rcParams["font.family"] = "sans-serif"

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
fig.suptitle("TikTok Analytics — Performance", fontsize=14, fontweight="bold")

# Graphique casting
moy_casting["moyenne_vues"].plot(
    kind="bar", ax=axes[0],
    color=["#ff4d8f", "#1a5ce8", "#1a9e5c"],
    edgecolor="none"
)
axes[0].set_title("Moyenne vues par Casting")
axes[0].set_xlabel("")
axes[0].tick_params(axis="x", rotation=0)

# Graphique lieu
moy_lieu["moyenne_vues"].plot(
    kind="bar", ax=axes[1],
    color=["#f5c518", "#ff4d8f", "#1a5ce8"],
    edgecolor="none"
)
axes[1].set_title("Moyenne vues par Lieu")
axes[1].set_xlabel("")
axes[1].tick_params(axis="x", rotation=0)

# Graphique hit/flop
perf_counts = df["performance"].value_counts()
perf_counts.plot(
    kind="pie", ax=axes[2],
    colors=["#1a9e5c", "#f5c518", "#e8341a"],
    autopct="%1.0f%%",
    startangle=90
)
axes[2].set_title("Répartition Hit / Moyen / Flop")
axes[2].set_ylabel("")

plt.tight_layout()
plt.savefig("analytics_overview.png", dpi=150, bbox_inches="tight")
plt.show()

# Courbes des vues dans le temps
fig, ax = plt.subplots(figsize=(14, 5))
fig.patch.set_facecolor("#f5f0e8")
ax.set_facecolor("#f5f0e8")

ax.plot(df["Date"], df["Vues"], 
        color="#ff4d8f", linewidth=2.5, zorder=3)

ax.fill_between(df["Date"], df["Vues"], 
                alpha=0.15, color="#ff4d8f")

moyenne = df["Vues"].mean()
ax.axhline(moyenne, color="#e8341a", linewidth=1.5, 
           linestyle="--", label=f"Moyenne : {moyenne:,.0f}")

# points verts sur les hits pour les reperer facilement
hits = df[df["Vues"] >= 50000]
others = df[df["Vues"] < 50000]

ax.scatter(others["Date"], others["Vues"], color="#ff4d8f", s=60, zorder=5)
ax.scatter(hits["Date"], hits["Vues"], color="#1a9e5c", s=100, zorder=6)


for _, row in df.iterrows():
    if row["Vues"] >= 50000:
        ax.annotate(
            f'{row["Titre"][:15]}\n{row["Vues"]:,}',
            xy=(row["Date"], row["Vues"]),
            xytext=(0, 12), textcoords="offset points",
            fontsize=7, ha="center", color="#0f0e0b"
        )

ax.set_title("Évolution des vues", fontsize=13, fontweight="bold")
ax.set_xlabel("Date")
ax.set_ylabel("Vues")
ax.legend()
ax.yaxis.set_major_formatter(
    plt.FuncFormatter(lambda x, _: f"{x/1000:.0f}k" if x >= 1000 else str(int(x)))
)

plt.tight_layout()
plt.savefig("evolution_vues.png", dpi=150, bbox_inches="tight")
plt.show()

# Meilleur jour pour poster
df["jour_semaine"] = df["Date"].dt.day_name(locale="fr_FR")

ordre_jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

moy_jours = df.groupby("jour_semaine").agg(
    nb_videos    = ("Vues", "count"),
    moyenne_vues = ("Vues", "mean")
).round(0).reindex(ordre_jours).dropna()

print(moy_jours)

# Graphique
fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_facecolor("#f5f0e8")
ax.set_facecolor("#f5f0e8")

barres = ax.bar(
    moy_jours.index,
    moy_jours["moyenne_vues"],
    color="#ff4d8f", edgecolor="none"
)

meilleur = moy_jours["moyenne_vues"].idxmax()
for barre, jour in zip(barres, moy_jours.index):
    if jour == meilleur:
        barre.set_color("#1a9e5c")

for barre in barres:
    hauteur = barre.get_height()
    ax.text(
        barre.get_x() + barre.get_width() / 2,
        hauteur + 500,
        f"{hauteur:,.0f}",
        ha="center", va="bottom", fontsize=8
    )

ax.set_title("Moyenne des vues par jour de publication", 
             fontsize=13, fontweight="bold")
ax.set_xlabel("")
ax.set_ylabel("Vues moyennes")
ax.yaxis.set_major_formatter(
    plt.FuncFormatter(lambda x, _: f"{x/1000:.0f}k" if x >= 1000 else str(int(x)))
)

plt.tight_layout()
plt.savefig("meilleur_jour.png", dpi=150, bbox_inches="tight")
plt.show()

print(f"\nMeilleur jour pour poster : {meilleur}")

# Conclusion

meilleur_casting = moy_casting["moyenne_vues"].idxmax()
meilleur_lieu = moy_lieu["moyenne_vues"].idxmax()
meilleur_jour = moy_jours["moyenne_vues"].idxmax()
nb_hits = len(df[df["performance"] == "Hit"])
nb_flops = len(df[df["performance"] == "Flop"])
taux_hit = round(nb_hits / len(df) * 100, 1)

print(f"\nsur {len(df)} videos :")
print(f"vues totales     : {df['Vues'].sum():,}")
print(f"moyenne vues     : {df['Vues'].mean():,.0f}")
print(f"engagement moyen : {df['taux_engagement'].mean():.2f}%")
print(f"hits (>=50k)     : {nb_hits} ({taux_hit}%)")
print(f" flops (<15k)     : {nb_flops}")
print(f"\nmeilleur casting : {meilleur_casting}")
print(f"meilleur lieu    : {meilleur_lieu}")
print(f"meilleur jour    : {meilleur}")
print(f"\nconclusion : poster en {meilleur_casting}, {meilleur_lieu}, le {meilleur}")
