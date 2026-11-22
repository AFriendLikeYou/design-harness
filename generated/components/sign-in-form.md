<!-- Generiert aus specs/system.json – nicht von Hand bearbeiten. -->
# SignInForm
Status: stable · v1.0.2 · Spec: ds/sign-in-form
Vollständiges Anmeldeformular aus TextField, Checkbox und Button. Als Ganzes verwenden statt neu zusammenzubauen.
```html
<script type="module">import "@fundament/ui";</script>
<fd-sign-in-form></fd-sign-in-form>
```

Props sind Attribute in kebab-case. Varianten mit false/true sind boolesche Attribute.

## Aussehen (Tokens je Variante oder Zustand)

| Für | Tokens |
|---|---|
| `default` | bg: `bg/surface`, fg: `text/primary`, border: `border/default`, borderWidth: `default` |

## Regeln

- **Nur aus Systemkomponenten zusammensetzen.** Warum: Muster zeigen Agenten und Menschen, wie Bausteine kombiniert werden. (`signinform/compose-from-system`, Check: `registered-only`)

## Barrierefreiheit

Fehlermeldungen oberhalb der Felder zusammenfassen und fokussieren.

## Do

- Muster komplett übernehmen

## Don't

- Felder ohne Label nachbauen
