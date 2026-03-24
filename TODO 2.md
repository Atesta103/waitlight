# TODO

## Storybook

### Composed

- [ ] CapacityIndicator - organisation texte en responsive
- [ ] StatusBanner - enlever icons et c'est quand qu'on a le StatusBanner with action ?
- [ ] TicketCard - process is not defined
- [ ] QueuePositionCard - Si 1 personne devant il faut afficher le StatusBanner et 0 personne aussi
- [ ] JoinForm - Interdire certain nom ?
- [ ] StatsCard - Vérifier espacement entre texte et icône
- [ ] QrcodeDisplay - process is not defined
- [ ] UserMenu - process is not defined
- [ ] HeaderQueueControl - process is not defined

### Design tokens

- [ ] Colors - Faire en sorte que les commerçants puisse choisir leurs couleurs

### UI

- [ ] Avatar - process is not defined
- [ ] Button - Attention couleurs secondaires si le commerçants choisi sa couleur
- [ ] Dropdown - On ne voit pas le menu déroulant correctement sur le storybook
- [ ] Input - Pour mdp ajouter un oeil pour voir le mdp
- [ ] ProgressBar - Espacement entre texte et valeurs
- [ ] QueueDot - La visualisation doit être vertical et non horizontal sur le stroybook

## Frontend pages

### Dashboard

- [ ] Régler problème syncro timer Qrcode
- [ ] Enlever url sous le Qrcode

### Analytics

- [ ] Meilleur moyen de représenter le volume par créneau horaire
- [ ] Exporter aussi en pdf et excel

### Settings

- [ ] Problème du menu sidebar en sticky
- [ ] Quand on clique sur un onglet du menu, on arrive sur la bonne section mais trop scroller (le titre est caché)
- [ ] Pouvoir changer le thème couleur de son application
- [ ] Peut être meilleur organisation des cards

## Animation Framer motion

- [ ] Ajouter animation changement état client

## Backend

### BDD

- [ ] Système d'archivage des tokens Qrcode (ne pas surcharger la bdd)
- [ ] Ajouter table de liste de nom discriminatoire commune a tout les commerçants (blocked_names) + table de nom discriminatoire par commerçant (merchant_blocked_names) + un commerçant peut signaler un nom discriminatoire si il est utilisé le commerçant va pourvoir choisir dans les settings de soit annuler le ticket de la personne, soit de mettre un nom par défaut à la place du nom discriminatoire dans tout les cas la personne va recevoir un popup

### API

- [ ] Ajouter rate limit sur les requêtes API

### Sécurité

- [ ] Ajouter un système de sécurité pour éviter les abus (Captcha, etc...)
