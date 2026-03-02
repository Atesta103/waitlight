# Idées de fonctionnalités

- **Ajustement automatique du temps de préparation** : Le commerçant définit un temps de préparation de base pour un article (ex: un burger). L'application mesure le temps réel pris pour préparer cet article. Si, après un certain nombre de commandes (ex: 50 fois), l'application constate que le temps de préparation moyen est systématiquement plus long ou plus court, elle met à jour automatiquement le temps de préparation estimé pour cet article.
  - **Comment l'intégrer ?** : Enregistrer l'horodatage exact de début et de fin de chaque préparation dans Supabase. Un trigger de base de données (ou un cron job/Edge Function) calcule la moyenne roulante des 50 dernières commandes de l'article, puis met à jour automatiquement le champ `estimated_time` de la table `articles` si l'écart est trop important vis-à-vis du temps actuel défini.

- **Prévision des commandes / stock** : L'application analyse les commandes passées et les commandes en cours pour prédire le nombre de commandes à venir. Cela permet au commerçant de prévoir les stocks et de préparer les articles en conséquence.
  - **Comment l'intégrer ?** : Créer un dashboard d'analyse (Analytics) requêtant l'historique des ventes (SQL par jour de la semaine et heure). Appliquer un algorithme statistique simple pour faire une suggestion de stock moyen (ex: "prévoir 40 pains burger ce soir").

- **Affichage mobile du QR Code commerçant** : Le commerçant peut se connecter à son espace depuis son smartphone pour générer et présenter un QR Code à ses clients. Cela leur permet de scanner le code pour commander, éliminant ainsi le besoin pour le commerçant de s'équiper d'un écran dédié à cet affichage.
  - **Comment l'intégrer ?** : Ajouter une vue dédiée "Générer un QR Code" sur l'interface du commerçant, formatée pour affichage mobile. Utiliser une bibliothèque comme `react-qr-code` ou `qrcode.react` qui embarque l'URL ou l'identifiant de la page de la boutique/table courante.

- **Authentification tierce pour les commerçants (SSO)** : Possibilité pour les commerçants de créer un compte et de se connecter de manière simple et sécurisée à l'aide de leurs identifiants Google ou Apple.
  - **Comment l'intégrer ?** : Activer les fournisseurs Google et Apple dans l'interface d'administration Auth de Supabase. Citer en frontend la méthode `supabase.auth.signInWithOAuth()` en associant les boutons "Continuer avec Google/Apple".

- **Détails de la commande client** : Côté commerçant / client, l'interface affiche de manière claire toutes les informations relatives à une commande en cours (numéro de commande, identité du client, détail et quantité des articles, montant total, etc.). **(Comment récupérer les infos sans que le commerçant doivent tout reécrire ?)**
  - **Comment l'intégrer ?** : Puisque le client commande directement au comptoir, voici les solutions pour éviter la double saisie pour le commerçant :
    1. **Connexion API avec la caisse (POS)** : C'est la solution idéale. L'application (ou le serveur Supabase) se connecte via une API au logiciel de caisse du commerçant (ex: Square, Zettle, Lightspeed). Dès la validation du paiement sur la caisse, celle-ci envoie automatiquement les détails de la commande à Waitlight (via Webhooks).
    2. **Catalogue de raccourcis (Boutons visuels)** : Si la caisse n'est pas connectable, l'interface commerçant propose une grille de gros boutons correspondant aux produits. Le commerçant "tapote" les articles pour constituer le ticket en 2 secondes, sans jamais utiliser son clavier.
    3. **Scan intelligent (OCR de ticket)** : (plus expérimental) Le commerçant utilise la caméra de son smartphone pour scanner un de ses tickets de caisse sortants, et l'app extrait automatiquement les articles et montants.

## Idées écartées (Hors périmètre)

Il est important de garder le focus sur la proposition de valeur principale de l'application. Voici les idées qui s'éloignent trop du concept initial ou qui nécessiteraient des efforts disproportionnés par rapport à leur utilité actuelle :

- **Commande directe par le client depuis l'application** : Retirée. Le concept actuel repose sur une commande effectuée et réglée directement au comptoir auprès du commerçant. L'application sert uniquement d'affichage de l'état d'avancement de cette commande au client (notamment via QR code/File d'attente virtuelle). Intégrer la commande côté client sur l'app transformerait le produit en outil complet de Click & Collect/Paiement en ligne, ce qui est très complexe (gestion des devises, frais Stripe, intégrations comptables, risques d'impayés, remboursements).
