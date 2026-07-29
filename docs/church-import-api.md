# Import massif des églises

L’endpoint `POST /api/admin/churches/import` accepte des lots de 1 à 500 fiches.
Il nécessite une session administrateur.

Chaque intégration doit utiliser un identifiant `source` stable. Chaque fiche doit
avoir un `sourceId` unique dans cette source. Un nouvel envoi avec la même paire
`source + sourceId` met la fiche à jour au lieu de créer un doublon.

```json
{
  "source": "annuaire-partenaire",
  "publish": false,
  "dryRun": true,
  "churches": [
    {
      "sourceId": "fr-bordeaux-001",
      "name": "Nom de la communauté",
      "aliases": ["NDC", "Nom court"],
      "networkName": "Nom du réseau",
      "campusName": "Bordeaux",
      "address": "10 rue Exemple",
      "postalCode": "33000",
      "city": "Bordeaux",
      "country": "France",
      "countryCode": "FR",
      "region": "Nouvelle-Aquitaine",
      "lat": 44.8378,
      "lng": -0.5792,
      "tradition": "Évangélique",
      "denomination": "Baptiste",
      "languages": ["Français"],
      "website": "https://example.org",
      "sourceUrl": "https://source.example/fiche/001",
      "lastVerifiedAt": "2026-07-29T00:00:00.000Z"
    }
  ]
}
```

Les coordonnées sont obligatoires pour un import massif. La géolocalisation doit
être réalisée en amont afin de ne pas surcharger ou bloquer le service de
géocodage pendant un gros import.

- `dryRun: true` valide le lot sans écrire.
- `publish: false` place les nouvelles fiches en attente de validation.
- `publish: true` publie les fiches immédiatement.
- Les erreurs sont retournées avec l’index et le `sourceId` de chaque fiche rejetée.

La recherche publique répond sous cette forme :

```json
{
  "churches": [],
  "total": 0,
  "page": 1,
  "limit": 12,
  "totalPages": 1,
  "center": null,
  "suggestions": []
}
```

Les `suggestions` ne sont pas comptées dans `total` : elles correspondent à des
communautés proches lorsque les critères exacts ne donnent aucun résultat.

Les filtres publics préparés pour un annuaire international sont `country`,
`countryCode`, `region`, `language`, `tradition`, `denomination`, `address`,
`radius` et `search`.

Le modèle contient également un statut de gestion et une liste de gestionnaires,
non exposés dans l’API publique. Ils permettront plus tard à une communauté
vérifiée de revendiquer sa fiche et de maintenir ses propres informations.
