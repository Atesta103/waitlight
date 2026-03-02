# 6. QR Code Dynamique

**Description** : Le commerçant affiche un gros QR code sur l'écran tactile face client (ou sur son propre téléphone) pour que le client le scanne pour rejoindre la file d'attente, éliminant le besoin d'une pancarte fixe.

## Implémentation Backend
* Rien à modifier sur la BDD. La route `/api/qr` ou la logique statique génère une URL contenant l'identifiant du commerçant.

## Implémentation Frontend
* Utilisation d'un composant comme `react-qr-code` au sein d'une page Next.js `/(dashboard)/qr-display`. 
* Cette vue devra empêcher la mise en veille de l'écran via l'**API WakeLock** du navigateur.
