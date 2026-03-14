# Gestion des erreurs et warnings non bloquants

*Dernière mise à jour : mars 2025*

## Actions réalisées

### 1. ESLint

- **Règle dépréciée** : `no-extra-semi` (dépréciée depuis ESLint 8.53, déplacée vers @stylistic) a été **désactivée**. Le formatage des point-virgules est géré par **Prettier** (`npm run format`).
- **Règle import/order** : désactivée à cause d’un bug de compatibilité avec ESLint 10 (`getTokenOrCommentBefore`). À réactiver après mise à jour d’`eslint-plugin-import`.

### 2. Console en production

- **`src/app/login/error.tsx`** : `console.error` n’est exécuté qu’en **development** (`process.env.NODE_ENV === 'development'`), comme dans `src/app/error.tsx`, pour éviter de polluer la console en production.

### 3. Clés React stables (éviter les warnings React)

- **FAQBlock.tsx** : `key={i}` remplacé par `key={item.q ?? i}` pour une clé stable quand la question est disponible.
- **Accordion.tsx** : `key={idx}` remplacé par `key={title || idx}` pour une clé plus stable.

### 4. Fichiers temporaires

- **eslint-report.json** : supprimé après vérification ; ajouté à `.gitignore` pour ne pas le committer si on relance un rapport JSON.

## Vérifications régulières

- `npm run lint` : 0 erreur, 0 warning (max-warnings=0).
- `npm run typecheck` : pas d’erreur TypeScript.
- `npm run build` : build Next.js OK.
- `npm run test` : tests Vitest OK.

Pour lister d’éventuels warnings sans faire échouer le lint :

```bash
npx eslint "src/**/*.{ts,tsx}" --no-error-on-unmatched-pattern --max-warnings 9999
```

Pour réactiver plus tard la règle sur l’ordre des imports (après mise à jour du plugin) :

- Réinstaller / mettre à jour `eslint-plugin-import` (version compatible ESLint 10).
- Dans `eslint.config.cjs`, remettre une règle du type :  
  `"import/order": ["warn", { "groups": [...], "newlines-between": "always", "alphabetize": { "order": "asc" } }]`.
