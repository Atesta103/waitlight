# Feature 11 : Internationalisation (i18n) — next-intl

- **Type** : Transversale (Cross-cutting concern)
- **Dépendances** : Toutes les autres features (affecte chaque composant avec du texte)
- **Priorité** : Haute — requis par `doc/accessibility.md` (WCAG 2.1 AA)
- **Statut** : ⬜ Non commencé

**Description** : Remplacer tout le texte français codé en dur dans les composants JSX par des clés `next-intl`. Ajouter le support du français (`fr`) et de l'anglais (`en`) comme première locale additionnelle obligatoire, avec détection automatique via `Accept-Language` et sélecteur de langue dans le footer.

> ⚠️ Blocage actuel : `next-intl` n'est pas installé. Tout le texte visible est actuellement en dur en français, en violation directe de `doc/accessibility.md` §Internationalisation.

---

## Sous-tâches d'intégration

### Infrastructure

- [ ] Installer `next-intl` (`npm install next-intl`) et documenter l'impact bundle (~30 Ko gzip).
- [ ] Configurer le middleware `next-intl` dans `proxy.ts` pour la détection de locale via `Accept-Language` et le stockage en cookie.
- [ ] Ajouter le préfixe de locale aux routes publiques : `/fr/[slug]`, `/en/[slug]` (routes marchands non préfixées ou préfixe optionnel selon décision).
- [ ] Créer `messages/fr.json` et `messages/en.json` — structure de clés par domaine (auth, onboarding, settings, dashboard, queue, common).
- [ ] Mettre à jour `next.config.ts` pour le support i18n.
- [ ] Wrapper les Server Components racines avec `NextIntlClientProvider`.

### Traduction des composants

- [ ] `components/sections/` — tous les organismes (`SettingsPanel`, `LoginForm`, `RegisterForm`, `OnboardingForm`, `QueueList`, `CustomerWaitView`, `DashboardHeader`, `StatsPanel`, `ForgotPasswordForm`, `ResetPasswordForm`).
- [ ] `components/composed/` — toutes les molécules avec texte visible (`SlugInput`, `QRCodeDisplay`, `CapacityIndicator`, `StatusBanner`, `JoinForm`, `WaitTimeEstimate`, `ConnectionStatus`, `ActivityFeed`, `TicketCard`).
- [ ] `components/ui/` — atomes avec texte (`Toast`, messages d'erreur `Input` / `Textarea`).
- [ ] `lib/actions/` — messages d'erreur des Server Actions traduits via `next-intl` (utiliser `getTranslations()` côté serveur).
- [ ] `lib/validators/` — messages d'erreur Zod traduits (passer la fonction `t()` aux schémas ou utiliser `z.setErrorMap`).
- [ ] Pages `app/` — `<title>` et balises meta (`metadata`) localisés via `generateMetadata`.

### UX — sélecteur de langue

- [ ] Créer un composant `LanguageSwitcher` dans `components/ui/` : affiche `Français` / `English` (jamais de drapeaux — règle `doc/accessibility.md`).
- [ ] Intégrer le sélecteur dans le footer du layout public et du layout dashboard.
- [ ] Persister le choix de langue dans un cookie (`NEXT_LOCALE`) et le relire au chargement.

### Formats localisés

- [ ] Remplacer tous les `toLocaleString('fr-FR')` par `Intl.DateTimeFormat` passé la locale active.
- [ ] Remplacer toutes les unités codées en dur (`"min"`, `"h"`, `"Ko"`) par des formats `Intl.NumberFormat` avec unités.

### Tests

- [ ] Vérifier que chaque clé `fr.json` a son équivalent dans `en.json` (script de lint ou CI check).
- [ ] Test E2E Playwright : changer la langue via le sélecteur et vérifier l'affichage en anglais sur `/[slug]`.

---

## Décisions à prendre avant l'implémentation

| Question                        | Options                                                                                | Recommandation                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Stratégie de routing            | Préfixe obligatoire (`/fr/*`, `/en/*`) vs préfixe optionnel (`/*` = locale par défaut) | Préfixe optionnel pour le français (défaut) — évite de casser les QR Codes imprimés existants |
| Fallback locale                 | `fr` → `en` ou `en` → `fr`                                                             | `en` comme fallback universel (convention `next-intl`)                                        |
| Traduction des e-mails Supabase | Hors scope `next-intl` — configurer dans le dashboard Supabase                         | Laisser en français pour l'instant, itérer en v2                                              |

---

## Notes d'architecture

- Les Server Actions qui retournent `{ error: string }` doivent utiliser `getTranslations()` de `next-intl/server` — ne **jamais** passer la locale comme paramètre de l'action.
- Les schémas Zod ne doivent **pas** recevoir de strings traduits hardcodés — utiliser `z.setErrorMap` avec la locale active ou surcharger les messages au niveau de l'action après `safeParse`.
- Le composant `SlugInput` affiche l'URL publique (`waitlight.app/[slug]`) — cette URL n'est pas traduite, mais les labels autour le sont.
