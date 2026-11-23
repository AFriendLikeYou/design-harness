// Fundament Start – legt in einer leeren Figma-Datei das Fundament an: Variablen, Text-Styles, Seiten und die Seite „Lies mich“.
// Komponenten baut das Plugin bewusst nicht. Sie entstehen in Figma; der Abgleich (Plugin „Fundament Export“ + node tooling/figma-diff.mjs)
// hält sie mit der Spec gleich. Generiert aus specs/system.json. Nicht von Hand bearbeiten, sondern Spec ändern und neu bauen.
const SPEC = {
  "name": "Fundament",
  "version": "1.4.0",
  "cssPrefix": "fd",
  "codePackage": "@fundament/ui",
  "primitives": {
    "color": {
      "neutral": {
        "0": "#FFFFFF",
        "50": "#F7F8FA",
        "100": "#EEF0F3",
        "200": "#DDE1E7",
        "300": "#C3C9D2",
        "500": "#6B7380",
        "700": "#3D4451",
        "800": "#272C35",
        "900": "#181C22",
        "950": "#0F1216"
      },
      "blue": {
        "50": "#EEF4FF",
        "300": "#93B4F5",
        "500": "#3B6FE0",
        "600": "#2557C7",
        "700": "#1C449E"
      },
      "green": {
        "50": "#ECF8F0",
        "300": "#86D3A2",
        "600": "#1F7A43",
        "700": "#17603A"
      },
      "amber": {
        "50": "#FDF5E6",
        "300": "#F2C46B",
        "600": "#9A5B00",
        "700": "#7A4700"
      },
      "red": {
        "50": "#FDEEEE",
        "300": "#F2A0A0",
        "600": "#C02B2B",
        "700": "#9C1F1F"
      }
    },
    "dimension": [
      0,
      1,
      2,
      4,
      8,
      12,
      16,
      20,
      24,
      32,
      36,
      40,
      44,
      48,
      64,
      320,
      360
    ],
    "fontSize": [
      12,
      14,
      16,
      20,
      24,
      32
    ],
    "lineHeight": [
      16,
      20,
      24,
      28,
      32,
      40
    ]
  },
  "semantic": {
    "color": {
      "bg/canvas": {
        "light": "neutral/50",
        "dark": "neutral/950",
        "scopes": [
          "FRAME_FILL"
        ],
        "why": "Grundfläche jeder Seite."
      },
      "bg/surface": {
        "light": "neutral/0",
        "dark": "neutral/900",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Karten, Eingabefelder und andere abgesetzte Flächen."
      },
      "bg/subtle": {
        "light": "neutral/100",
        "dark": "neutral/800",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Neutrale Hervorhebung, z. B. neutrales Badge oder Hover von sekundären und Ghost-Buttons. Nicht für deaktivierte Elemente, dafür bg/disabled."
      },
      "bg/disabled": {
        "light": "neutral/100",
        "dark": "neutral/800",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Fläche deaktivierter Bedienelemente. Heute gleicher Wert wie bg/subtle, aber eigene Rolle: nur für Deaktiviertes."
      },
      "text/primary": {
        "light": "neutral/900",
        "dark": "neutral/50",
        "scopes": [
          "TEXT_FILL"
        ],
        "why": "Fließtext und Überschriften. Besteht 4,5:1 auf allen bg-Tokens."
      },
      "text/secondary": {
        "light": "neutral/700",
        "dark": "neutral/300",
        "scopes": [
          "TEXT_FILL"
        ],
        "why": "Hilfstexte und Metadaten. Besteht 4,5:1 auf allen bg-Tokens."
      },
      "text/disabled": {
        "light": "neutral/500",
        "dark": "neutral/500",
        "scopes": [
          "TEXT_FILL"
        ],
        "why": "Nur für deaktivierte Elemente; muss keinen Kontrast erfüllen."
      },
      "text/on-action": {
        "light": "neutral/0",
        "dark": "neutral/0",
        "scopes": [
          "TEXT_FILL",
          "STROKE_COLOR"
        ],
        "why": "Text und Icons auf action/primary und action/danger."
      },
      "border/default": {
        "light": "neutral/200",
        "dark": "neutral/700",
        "scopes": [
          "STROKE_COLOR"
        ],
        "why": "Trennlinien und Kartenrahmen."
      },
      "border/input": {
        "light": "neutral/500",
        "dark": "neutral/500",
        "scopes": [
          "STROKE_COLOR"
        ],
        "why": "Rahmen von Eingabefeldern. Besteht 3:1 für Bedienelemente."
      },
      "action/primary": {
        "light": "blue/600",
        "dark": "blue/600",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Eine primäre Aktion pro Ansicht. Besteht 4,5:1 mit text/on-action."
      },
      "action/primary-hover": {
        "light": "blue/700",
        "dark": "blue/700",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Hover-Zustand der primären Aktion."
      },
      "action/danger": {
        "light": "red/600",
        "dark": "red/600",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Aktion, die etwas unwiderruflich löscht oder beendet. Besteht 4,5:1 mit text/on-action."
      },
      "action/danger-hover": {
        "light": "red/700",
        "dark": "red/700",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Hover-Zustand der gefährlichen Aktion."
      },
      "focus/ring": {
        "light": "blue/500",
        "dark": "blue/300",
        "scopes": [
          "STROKE_COLOR"
        ],
        "why": "Sichtbarer Tastaturfokus, nie entfernen."
      },
      "feedback/info-bg": {
        "light": "blue/50",
        "dark": "neutral/800",
        "scopes": [
          "FRAME_FILL"
        ],
        "why": "Hintergrund für Hinweise."
      },
      "feedback/info-fg": {
        "light": "blue/700",
        "dark": "blue/300",
        "scopes": [
          "TEXT_FILL",
          "STROKE_COLOR"
        ],
        "why": "Text und Akzent für Hinweise."
      },
      "feedback/success-bg": {
        "light": "green/50",
        "dark": "neutral/800",
        "scopes": [
          "FRAME_FILL"
        ],
        "why": "Hintergrund für Erfolgsmeldungen."
      },
      "feedback/success-fg": {
        "light": "green/700",
        "dark": "green/300",
        "scopes": [
          "TEXT_FILL",
          "STROKE_COLOR"
        ],
        "why": "Text und Akzent für Erfolg."
      },
      "feedback/warning-bg": {
        "light": "amber/50",
        "dark": "neutral/800",
        "scopes": [
          "FRAME_FILL"
        ],
        "why": "Hintergrund für Warnungen."
      },
      "feedback/warning-fg": {
        "light": "amber/700",
        "dark": "amber/300",
        "scopes": [
          "TEXT_FILL",
          "STROKE_COLOR"
        ],
        "why": "Text und Akzent für Warnungen."
      },
      "feedback/danger-bg": {
        "light": "red/50",
        "dark": "neutral/800",
        "scopes": [
          "FRAME_FILL"
        ],
        "why": "Hintergrund für Fehler."
      },
      "feedback/danger-fg": {
        "light": "red/700",
        "dark": "red/300",
        "scopes": [
          "TEXT_FILL",
          "STROKE_COLOR"
        ],
        "why": "Text und Akzent für Fehler, auch Fehlerrahmen."
      }
    },
    "space": {
      "2xs": {
        "value": 2,
        "why": "Feinabstand, z. B. Label zu Feld."
      },
      "xs": {
        "value": 4,
        "why": "Abstand innerhalb kleiner Elemente."
      },
      "sm": {
        "value": 8,
        "why": "Standardabstand zwischen verwandten Elementen."
      },
      "md": {
        "value": 12,
        "why": "Innenabstand kleiner Bedienelemente."
      },
      "lg": {
        "value": 16,
        "why": "Innenabstand Bedienelemente, Abstand zwischen Feldern."
      },
      "xl": {
        "value": 24,
        "why": "Innenabstand Karten, Abstand zwischen Gruppen."
      },
      "2xl": {
        "value": 32,
        "why": "Abstand zwischen Abschnitten."
      },
      "3xl": {
        "value": 48,
        "why": "Seitenränder auf großen Viewports."
      }
    },
    "radius": {
      "sm": {
        "value": 4,
        "why": "Checkboxen und kleine Flächen."
      },
      "md": {
        "value": 8,
        "why": "Buttons und Eingabefelder."
      },
      "lg": {
        "value": 12,
        "why": "Karten und Hinweise."
      },
      "full": {
        "value": 999,
        "why": "Badges und Pillen."
      }
    },
    "border-width": {
      "default": {
        "value": 1,
        "why": "Rahmen von Feldern, Karten und sekundären Buttons."
      },
      "strong": {
        "value": 2,
        "why": "Fehlerrahmen und Fokusring."
      },
      "accent": {
        "value": 4,
        "why": "Akzentkante von Hinweisen."
      }
    },
    "size": {
      "checkbox": {
        "value": 20,
        "why": "Kantenlänge der Checkbox."
      },
      "touch-target": {
        "value": 44,
        "why": "Mindesthöhe der Klickfläche von Bedienelementen mit kleiner Darstellung."
      },
      "switch-width": {
        "value": 36,
        "why": "Breite der Schalterbahn."
      },
      "switch-thumb": {
        "value": 16,
        "why": "Durchmesser des Schalterknopfs."
      },
      "field": {
        "value": 320,
        "why": "Vorschaubreite eines Eingabefelds; im Layout füllt das Feld seinen Container."
      },
      "panel": {
        "value": 360,
        "why": "Höchstbreite schmaler Formulare und Hinweise."
      }
    }
  },
  "textStyles": [
    {
      "name": "display",
      "size": 32,
      "line": 40,
      "weight": "Bold",
      "why": "Seitentitel. Einmal pro Seite."
    },
    {
      "name": "heading/lg",
      "size": 24,
      "line": 32,
      "weight": "Semi Bold",
      "why": "Abschnittsüberschriften."
    },
    {
      "name": "heading/md",
      "size": 20,
      "line": 28,
      "weight": "Semi Bold",
      "why": "Karten- und Gruppenüberschriften."
    },
    {
      "name": "body/md",
      "size": 16,
      "line": 24,
      "weight": "Regular",
      "why": "Standard-Fließtext."
    },
    {
      "name": "body/sm",
      "size": 14,
      "line": 20,
      "weight": "Regular",
      "why": "Hilfstexte und dichte Ansichten."
    },
    {
      "name": "label/md",
      "size": 14,
      "line": 20,
      "weight": "Medium",
      "why": "Beschriftung von Buttons und Feldern."
    },
    {
      "name": "label/sm",
      "size": 12,
      "line": 16,
      "weight": "Medium",
      "why": "Badges und kompakte Labels."
    },
    {
      "name": "caption",
      "size": 12,
      "line": 16,
      "weight": "Regular",
      "why": "Metadaten, Bildunterschriften."
    }
  ],
  "components": [
    {
      "name": "Button",
      "kind": "component",
      "status": "stable",
      "version": "1.4.1",
      "purpose": "Löst eine Aktion aus. Für Navigation zu einer anderen Seite einen Link verwenden.",
      "props": [
        {
          "name": "variant",
          "type": "variant",
          "values": [
            "primary",
            "secondary",
            "ghost",
            "danger"
          ],
          "default": "primary"
        },
        {
          "name": "size",
          "type": "variant",
          "values": [
            "md",
            "sm"
          ],
          "default": "md"
        },
        {
          "name": "disabled",
          "type": "variant",
          "values": [
            "false",
            "true"
          ],
          "default": "false"
        },
        {
          "name": "state",
          "type": "variant",
          "values": [
            "default",
            "hover",
            "focus"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "Speichern"
        }
      ],
      "rules": [
        {
          "id": "button/one-primary",
          "text": "Höchstens ein primärer Button pro Ansicht; ein danger-Button und ConfirmAction zählen als primär.",
          "why": "Mehrere primäre Aktionen konkurrieren um Aufmerksamkeit.",
          "check": "max-per-view"
        },
        {
          "id": "button/label-verb",
          "text": "Beschriftung beginnt mit einem Verb und nennt das Ergebnis.",
          "why": "Nutzer:innen wissen vor dem Klick, was passiert.",
          "check": null
        },
        {
          "id": "button/no-custom-colors",
          "text": "Farbe nur über variant, nie eigene Füllungen.",
          "why": "Sonst brechen Dark Mode und Kontrastgarantie.",
          "check": "no-raw-color"
        },
        {
          "id": "button/states-from-system",
          "text": "Hover und Fokus kommen aus der Komponente, nie selbst gestaltet.",
          "why": "Der Fokusring ist eine Zusage an Tastaturnutzer:innen und muss überall gleich aussehen.",
          "check": null
        },
        {
          "id": "button/danger-confirm",
          "text": "variant=danger nur für Aktionen, die etwas unwiderruflich löschen oder beenden, und nie als einzige Absicherung.",
          "why": "Rot warnt, schützt aber nicht vor einem versehentlichen Klick; es braucht zusätzlich eine Bestätigung.",
          "check": null
        }
      ],
      "a11y": "Immer als <button> umsetzen. Deaktiviert nur, wenn ein Hinweis erklärt, warum.",
      "do": [
        "„Änderungen speichern“",
        "Primär + sekundär nebeneinander"
      ],
      "dont": [
        "„Hier klicken“",
        "Zwei primäre Buttons nebeneinander"
      ],
      "styles": {
        "variant=primary": {
          "bg": "action/primary",
          "fg": "text/on-action"
        },
        "variant=primary, state=hover": {
          "bg": "action/primary-hover"
        },
        "variant=secondary": {
          "bg": "bg/surface",
          "fg": "text/primary",
          "border": "border/input",
          "borderWidth": "default"
        },
        "variant=secondary, state=hover": {
          "bg": "bg/subtle"
        },
        "variant=ghost": {
          "fg": "feedback/info-fg"
        },
        "variant=ghost, state=hover": {
          "bg": "bg/subtle"
        },
        "variant=danger": {
          "bg": "action/danger",
          "fg": "text/on-action"
        },
        "variant=danger, state=hover": {
          "bg": "action/danger-hover"
        },
        "state=focus": {
          "ring": "focus/ring",
          "ringWidth": "strong"
        },
        "disabled=true": {
          "bg": "bg/disabled",
          "fg": "text/disabled"
        }
      }
    },
    {
      "name": "TextField",
      "kind": "component",
      "status": "stable",
      "version": "1.3.0",
      "purpose": "Einzeilige Texteingabe mit sichtbarem Label und optionalem Hilfstext.",
      "props": [
        {
          "name": "state",
          "type": "variant",
          "values": [
            "default",
            "focus",
            "error",
            "disabled"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "E-Mail-Adresse"
        },
        {
          "name": "value",
          "type": "text",
          "default": "name@beispiel.de"
        },
        {
          "name": "helperText",
          "type": "text",
          "default": "Wir senden dir einen Bestätigungslink."
        },
        {
          "name": "showHelper",
          "type": "boolean",
          "default": true
        },
        {
          "name": "errorText",
          "type": "text",
          "default": "Bitte gib eine gültige E-Mail-Adresse ein."
        },
        {
          "name": "showTrailing",
          "type": "boolean",
          "default": false
        },
        {
          "name": "trailing",
          "type": "instance",
          "default": "Button"
        },
        {
          "name": "trailingAction",
          "type": "behavior",
          "values": [
            "none",
            "reveal",
            "clear"
          ],
          "default": "none"
        }
      ],
      "rules": [
        {
          "id": "textfield/visible-label",
          "text": "Label ist immer sichtbar, nie nur als Platzhalter.",
          "why": "Platzhalter verschwinden beim Tippen und sind für Screenreader unzuverlässig.",
          "check": "required-prop"
        },
        {
          "id": "textfield/error-text",
          "text": "Im Fehlerzustand ersetzt errorText den Hilfstext und erklärt, wie man den Fehler behebt.",
          "why": "Rot allein sagt nicht, was zu tun ist.",
          "check": null
        },
        {
          "id": "textfield/trailing-slot",
          "text": "Aktionen im Feld (Passwort anzeigen, Eingabe leeren) nur über den Slot trailing, mit einem Button variant=ghost size=sm.",
          "why": "Selbst über das Feld gelegte Knöpfe verlieren Fokusreihenfolge und Abstände.",
          "check": "slot-content"
        },
        {
          "id": "textfield/trailing-behavior",
          "text": "Passwort anzeigen und Eingabe leeren kommen über trailingAction (reveal, clear), nicht über eigenes Skript.",
          "why": "Nur so stimmen Beschriftung, aria-pressed und Fokus bei jedem Feld überein.",
          "check": null
        }
      ],
      "a11y": "Label per <label for> verknüpfen, Hilfs- und Fehlertext per aria-describedby; Fehler mit aria-invalid.",
      "do": [
        "„Bitte gib eine gültige E-Mail-Adresse ein.“"
      ],
      "dont": [
        "Nur roter Rahmen ohne Text",
        "Label als Platzhalter"
      ],
      "styles": {
        "state=default": {
          "bg": "bg/surface",
          "fg": "text/primary",
          "border": "border/input",
          "borderWidth": "default",
          "helper": "text/secondary"
        },
        "state=focus": {
          "ring": "focus/ring",
          "ringWidth": "strong"
        },
        "state=error": {
          "border": "feedback/danger-fg",
          "borderWidth": "strong",
          "helper": "feedback/danger-fg"
        },
        "state=disabled": {
          "bg": "bg/disabled",
          "fg": "text/disabled"
        }
      }
    },
    {
      "name": "Checkbox",
      "kind": "component",
      "status": "stable",
      "version": "1.2.0",
      "purpose": "Auswahl einer unabhängigen Option, die man an- oder abwählen kann.",
      "props": [
        {
          "name": "checked",
          "type": "variant",
          "values": [
            "false",
            "true"
          ],
          "default": "false"
        },
        {
          "name": "disabled",
          "type": "variant",
          "values": [
            "false",
            "true"
          ],
          "default": "false"
        },
        {
          "name": "state",
          "type": "variant",
          "values": [
            "default",
            "focus"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "Angemeldet bleiben"
        },
        {
          "name": "helperText",
          "type": "text",
          "default": "Du kannst das später ändern."
        },
        {
          "name": "showHelper",
          "type": "boolean",
          "default": false
        }
      ],
      "rules": [
        {
          "id": "checkbox/label-clickable",
          "text": "Das Label ist Teil der Klickfläche.",
          "why": "Die Box allein ist mit 20 px zu klein für Touch.",
          "check": null
        },
        {
          "id": "checkbox/disabled-reason",
          "text": "Ist die Checkbox deaktiviert, erklärt helperText den Grund.",
          "why": "Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler.",
          "check": "required-when-disabled"
        }
      ],
      "a11y": "Natives <input type=\"checkbox\"> mit <label>; Klickfläche mindestens 44 × 44 px.",
      "do": [
        "Kurzes Label in Satzschreibung"
      ],
      "dont": [
        "Checkbox für sofort wirksame Einstellungen (dafür Switch)"
      ],
      "styles": {
        "checked=false": {
          "bg": "bg/surface",
          "fg": "text/primary",
          "border": "border/input",
          "borderWidth": "default",
          "helper": "text/secondary"
        },
        "checked=true": {
          "bg": "action/primary",
          "mark": "text/on-action"
        },
        "state=focus": {
          "ring": "focus/ring",
          "ringWidth": "strong"
        },
        "disabled=true": {
          "bg": "bg/disabled",
          "fg": "text/disabled",
          "mark": "text/disabled"
        }
      }
    },
    {
      "name": "Switch",
      "kind": "component",
      "status": "stable",
      "version": "1.0.0",
      "purpose": "Schaltet eine Einstellung sofort ein oder aus, ohne Speichern.",
      "props": [
        {
          "name": "checked",
          "type": "variant",
          "values": [
            "false",
            "true"
          ],
          "default": "false"
        },
        {
          "name": "disabled",
          "type": "variant",
          "values": [
            "false",
            "true"
          ],
          "default": "false"
        },
        {
          "name": "state",
          "type": "variant",
          "values": [
            "default",
            "focus"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "E-Mail-Benachrichtigungen"
        },
        {
          "name": "helperText",
          "type": "text",
          "default": "Wir schreiben dir höchstens einmal pro Woche."
        },
        {
          "name": "showHelper",
          "type": "boolean",
          "default": false
        }
      ],
      "styles": {
        "checked=false": {
          "bg": "border/input",
          "thumb": "text/on-action",
          "fg": "text/primary",
          "helper": "text/secondary"
        },
        "checked=true": {
          "bg": "action/primary"
        },
        "state=focus": {
          "ring": "focus/ring",
          "ringWidth": "strong"
        },
        "disabled=true": {
          "bg": "bg/disabled",
          "thumb": "text/disabled",
          "fg": "text/disabled"
        }
      },
      "rules": [
        {
          "id": "switch/immediate",
          "text": "Nur für Einstellungen, die sofort wirken. Braucht es Speichern, eine Checkbox verwenden.",
          "why": "Ein Schalter verspricht, dass die Änderung schon gilt.",
          "check": null
        },
        {
          "id": "switch/disabled-reason",
          "text": "Ist der Schalter deaktiviert, erklärt helperText den Grund.",
          "why": "Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler.",
          "check": "required-when-disabled"
        }
      ],
      "a11y": "Als <button role=\"switch\"> mit aria-checked umsetzen; das Label benennt die Einstellung, nicht den Zustand.",
      "do": [
        "„E-Mail-Benachrichtigungen“"
      ],
      "dont": [
        "„An“ oder „Aus“ als Label",
        "Schalter in einem Formular mit Speichern-Button"
      ]
    },
    {
      "name": "Badge",
      "kind": "component",
      "status": "stable",
      "version": "1.0.0",
      "purpose": "Kurzer Status oder Kategorie, nicht interaktiv.",
      "props": [
        {
          "name": "tone",
          "type": "variant",
          "values": [
            "neutral",
            "info",
            "success",
            "warning",
            "danger"
          ],
          "default": "neutral"
        },
        {
          "name": "label",
          "type": "text",
          "default": "Neu"
        }
      ],
      "rules": [
        {
          "id": "badge/short-label",
          "text": "Höchstens zwei Wörter.",
          "why": "Badges werden überflogen, nicht gelesen.",
          "check": "max-words"
        },
        {
          "id": "badge/not-interactive",
          "text": "Nie klickbar; für Filter einen Chip verwenden.",
          "why": "Badges sehen nicht nach Bedienelement aus.",
          "check": null
        }
      ],
      "a11y": "Bedeutung steht im Text, nicht nur in der Farbe.",
      "do": [
        "„Entwurf“",
        "„Veröffentlicht“"
      ],
      "dont": [
        "Ganze Sätze",
        "Badge als Button"
      ],
      "styles": {
        "tone=neutral": {
          "bg": "bg/subtle",
          "fg": "text/secondary"
        },
        "tone=info": {
          "bg": "feedback/info-bg",
          "fg": "feedback/info-fg"
        },
        "tone=success": {
          "bg": "feedback/success-bg",
          "fg": "feedback/success-fg"
        },
        "tone=warning": {
          "bg": "feedback/warning-bg",
          "fg": "feedback/warning-fg"
        },
        "tone=danger": {
          "bg": "feedback/danger-bg",
          "fg": "feedback/danger-fg"
        }
      }
    },
    {
      "name": "Alert",
      "kind": "component",
      "status": "stable",
      "version": "1.0.2",
      "purpose": "Hinweis im Seitenfluss zu Status, Erfolg, Warnung oder Fehler.",
      "props": [
        {
          "name": "tone",
          "type": "variant",
          "values": [
            "info",
            "success",
            "warning",
            "danger"
          ],
          "default": "info"
        },
        {
          "name": "title",
          "type": "text",
          "default": "Änderungen gespeichert"
        },
        {
          "name": "description",
          "type": "text",
          "default": "Deine Einstellungen gelten ab sofort."
        }
      ],
      "rules": [
        {
          "id": "alert/one-per-area",
          "text": "Höchstens ein Alert pro Bereich.",
          "why": "Mehrere Hinweise übereinander werden ignoriert.",
          "check": "max-per-parent"
        },
        {
          "id": "alert/title-states-outcome",
          "text": "Titel nennt das Ergebnis, Beschreibung den nächsten Schritt.",
          "why": "Man soll den Titel allein verstehen können.",
          "check": null
        },
        {
          "id": "alert/no-action",
          "text": "Ein Alert enthält keine Aktion. Die Beschreibung nennt den nächsten Schritt, die Aktion steht dort, wo sie wirkt.",
          "why": "Eine Aktion im Hinweis konkurriert mit der Hauptaktion der Seite.",
          "check": null
        }
      ],
      "a11y": "Fehler und Warnungen mit role=\"alert\", Info und Erfolg mit role=\"status\".",
      "do": [
        "„Zahlung fehlgeschlagen“ + „Prüfe deine Kartendaten.“"
      ],
      "dont": [
        "„Fehler!“ ohne Erklärung"
      ],
      "styles": {
        "tone=info": {
          "bg": "feedback/info-bg",
          "fg": "feedback/info-fg",
          "body": "text/primary",
          "border": "feedback/info-fg",
          "borderWidth": "accent"
        },
        "tone=success": {
          "bg": "feedback/success-bg",
          "fg": "feedback/success-fg",
          "body": "text/primary",
          "border": "feedback/success-fg",
          "borderWidth": "accent"
        },
        "tone=warning": {
          "bg": "feedback/warning-bg",
          "fg": "feedback/warning-fg",
          "body": "text/primary",
          "border": "feedback/warning-fg",
          "borderWidth": "accent"
        },
        "tone=danger": {
          "bg": "feedback/danger-bg",
          "fg": "feedback/danger-fg",
          "body": "text/primary",
          "border": "feedback/danger-fg",
          "borderWidth": "accent"
        }
      }
    },
    {
      "name": "Card",
      "kind": "component",
      "status": "stable",
      "version": "1.1.0",
      "purpose": "Gruppiert zusammengehörige Inhalte mit optionaler Aktion.",
      "props": [
        {
          "name": "title",
          "type": "text",
          "default": "Kartentitel"
        },
        {
          "name": "body",
          "type": "text",
          "default": "Kurze Beschreibung des Inhalts in ein bis zwei Sätzen."
        },
        {
          "name": "showFooter",
          "type": "boolean",
          "default": true
        },
        {
          "name": "action",
          "type": "instance",
          "default": "Button"
        },
        {
          "name": "showBadge",
          "type": "boolean",
          "default": false
        },
        {
          "name": "badge",
          "type": "instance",
          "default": "Badge"
        }
      ],
      "rules": [
        {
          "id": "card/one-action",
          "text": "Höchstens eine Aktion im Footer.",
          "why": "Karten sind Einstiege, keine Formulare.",
          "check": "max-children"
        },
        {
          "id": "card/no-nesting",
          "text": "Keine Karten in Karten.",
          "why": "Verschachtelte Rahmen zerstören die Hierarchie.",
          "check": "no-nesting"
        },
        {
          "id": "card/badge-slot",
          "text": "Eine Kennzeichnung der Karte (z. B. „Aktuell“) gehört in den Slot badge, nicht daneben oder darüber.",
          "why": "Nur im Slot bleibt die Kennzeichnung beim Umbruch an der Karte.",
          "check": "slot-content"
        }
      ],
      "a11y": "Titel als Überschrift passender Ebene; ist die ganze Karte klickbar, nur ein Link darin.",
      "do": [
        "Eine klare Aktion"
      ],
      "dont": [
        "Karte in Karte",
        "Drei Buttons im Footer"
      ],
      "styles": {
        "default": {
          "bg": "bg/surface",
          "fg": "text/primary",
          "body": "text/secondary",
          "border": "border/default",
          "borderWidth": "default"
        }
      }
    },
    {
      "name": "Link",
      "kind": "component",
      "status": "stable",
      "version": "1.0.0",
      "purpose": "Führt zu einer anderen Seite oder Stelle. Für Aktionen einen Button verwenden.",
      "props": [
        {
          "name": "state",
          "type": "variant",
          "values": [
            "default",
            "hover",
            "focus"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "Alle Rechnungen ansehen"
        }
      ],
      "styles": {
        "state=default": {
          "fg": "feedback/info-fg"
        },
        "state=hover": {
          "fg": "text/primary"
        },
        "state=focus": {
          "ring": "focus/ring",
          "ringWidth": "strong"
        }
      },
      "rules": [
        {
          "id": "link/names-destination",
          "text": "Der Linktext nennt das Ziel.",
          "why": "„Hier“ oder „Mehr“ sagen nicht, wohin es geht, und sind in einer Linkliste nicht unterscheidbar.",
          "check": "no-vague-action"
        },
        {
          "id": "link/has-target",
          "text": "Ein Link hat immer ein Ziel (href).",
          "why": "Ohne Ziel ist er eine Aktion und gehört in einen Button.",
          "check": "required-prop"
        }
      ],
      "a11y": "Als <a href> umsetzen. Öffnet der Link ein neues Fenster, steht das im Text.",
      "do": [
        "„Alle Rechnungen ansehen“"
      ],
      "dont": [
        "„Hier“",
        "Link, der etwas speichert oder löscht"
      ]
    },
    {
      "name": "SignInForm",
      "kind": "pattern",
      "status": "stable",
      "version": "1.0.2",
      "purpose": "Vollständiges Anmeldeformular aus TextField, Checkbox und Button. Als Ganzes verwenden statt neu zusammenzubauen.",
      "props": [],
      "rules": [
        {
          "id": "signinform/compose-from-system",
          "text": "Nur aus Systemkomponenten zusammensetzen.",
          "why": "Muster zeigen Agenten und Menschen, wie Bausteine kombiniert werden.",
          "check": "registered-only"
        }
      ],
      "a11y": "Fehlermeldungen oberhalb der Felder zusammenfassen und fokussieren.",
      "do": [
        "Muster komplett übernehmen"
      ],
      "dont": [
        "Felder ohne Label nachbauen"
      ],
      "styles": {
        "default": {
          "bg": "bg/surface",
          "fg": "text/primary",
          "border": "border/default",
          "borderWidth": "default"
        }
      }
    },
    {
      "name": "ConfirmAction",
      "kind": "pattern",
      "status": "stable",
      "version": "1.0.0",
      "purpose": "Sichert eine unwiderrufliche Aktion ab: Der danger-Button wird erst aktiv, wenn das Bestätigungswort eingegeben ist.",
      "props": [
        {
          "name": "word",
          "type": "codeText",
          "default": "LÖSCHEN"
        },
        {
          "name": "fieldLabel",
          "type": "codeText",
          "default": "Gib zur Bestätigung LÖSCHEN ein"
        },
        {
          "name": "actionLabel",
          "type": "codeText",
          "default": "Konto endgültig löschen"
        }
      ],
      "styles": {
        "default": {
          "fg": "text/primary"
        }
      },
      "rules": [
        {
          "id": "confirmaction/for-irreversible",
          "text": "Jede Aktion, die Daten unwiderruflich löscht, läuft über ConfirmAction.",
          "why": "Ein roter Button allein schützt nicht vor einem versehentlichen Klick.",
          "check": null
        },
        {
          "id": "confirmaction/no-custom-script",
          "text": "Das Freischalten kommt aus dem Muster, nicht aus eigenem Skript.",
          "why": "Sonst unterscheiden sich Bestätigungen von Seite zu Seite.",
          "check": null
        }
      ],
      "a11y": "Der Button nennt die Aktion. Warum er deaktiviert ist, steht als Hilfstext am Feld und ist per aria-describedby verknüpft.",
      "do": [
        "Bestätigungswort nennt die Aktion: „LÖSCHEN“"
      ],
      "dont": [
        "Bestätigung per Checkbox",
        "Eigenes Skript, das einen Button freischaltet"
      ]
    },
    {
      "name": "LinkButton",
      "kind": "component",
      "status": "deprecated",
      "version": "0.9.0",
      "purpose": "Veraltet seit 1.0. Ersetzt durch Button variant=ghost.",
      "deprecated": {
        "since": "1.0.0",
        "use": "Button variant=ghost"
      },
      "props": [
        {
          "name": "label",
          "type": "text",
          "default": "Mehr"
        }
      ],
      "rules": [],
      "a11y": "–",
      "do": [],
      "dont": [
        "Neu verwenden"
      ],
      "styles": {
        "default": {
          "fg": "feedback/info-fg"
        }
      }
    }
  ],
  "contrast": [
    {
      "fg": "text/primary",
      "on": [
        "bg/canvas",
        "bg/surface",
        "bg/subtle",
        "feedback/info-bg",
        "feedback/success-bg",
        "feedback/warning-bg",
        "feedback/danger-bg"
      ],
      "min": 4.5,
      "why": "Fließtext"
    },
    {
      "fg": "text/secondary",
      "on": [
        "bg/canvas",
        "bg/surface",
        "bg/subtle"
      ],
      "min": 4.5,
      "why": "Hilfstext"
    },
    {
      "fg": "text/on-action",
      "on": [
        "action/primary",
        "action/primary-hover",
        "action/danger",
        "action/danger-hover"
      ],
      "min": 4.5,
      "why": "Beschriftung primärer Buttons"
    },
    {
      "fg": "feedback/info-fg",
      "on": [
        "feedback/info-bg"
      ],
      "min": 4.5,
      "why": "Titel im Alert, Text im Badge"
    },
    {
      "fg": "feedback/success-fg",
      "on": [
        "feedback/success-bg"
      ],
      "min": 4.5,
      "why": "Titel im Alert, Text im Badge"
    },
    {
      "fg": "feedback/warning-fg",
      "on": [
        "feedback/warning-bg"
      ],
      "min": 4.5,
      "why": "Titel im Alert, Text im Badge"
    },
    {
      "fg": "feedback/danger-fg",
      "on": [
        "feedback/danger-bg"
      ],
      "min": 4.5,
      "why": "Titel im Alert, Text im Badge"
    },
    {
      "fg": "feedback/info-fg",
      "on": [
        "bg/canvas",
        "bg/surface",
        "bg/subtle"
      ],
      "min": 4.5,
      "why": "Beschriftung Ghost-Button, auch im Hover"
    },
    {
      "fg": "feedback/danger-fg",
      "on": [
        "bg/canvas",
        "bg/surface"
      ],
      "min": 4.5,
      "why": "Fehlertext unter dem Feld"
    },
    {
      "fg": "border/input",
      "on": [
        "bg/canvas",
        "bg/surface"
      ],
      "min": 3,
      "why": "Rahmen von Bedienelementen"
    },
    {
      "fg": "focus/ring",
      "on": [
        "bg/canvas",
        "bg/surface"
      ],
      "min": 3,
      "why": "Fokusring"
    },
    {
      "fg": "text/on-action",
      "on": [
        "border/input"
      ],
      "min": 3,
      "why": "Schalterknopf auf ausgeschalteter Bahn"
    }
  ],
  "changelog": [
    {
      "version": "1.4.0",
      "text": "Neu: Link für Navigation und das Muster ConfirmAction für unwiderrufliche Aktionen. Alert bleibt ohne Aktion (Regel alert/no-action). Check mit eigenem HTML-Parser und Prüfung im gerenderten Zustand (audit)."
    },
    {
      "version": "1.3.0",
      "text": "TextField: trailingAction (reveal, clear) bringt das Verhalten für den Slot trailing mit. Card: Slot badge. Beide Lücken stammen aus der Messung mit sechs Agentenläufen."
    },
    {
      "version": "1.2.0",
      "text": "Neu: Switch. Button variant=danger mit Tokens action/danger. Checkbox mit helperText. Größen-Tokens field, panel, switch-width, switch-thumb. Code als Web Components (@fundament/ui)."
    },
    {
      "version": "1.1.0",
      "text": "Hover und Fokus als Varianten (Button, TextField, Checkbox). TextField mit Slot trailing und eigener Property errorText. Neue Tokens border-width und size. Kontrastpaare nachgerechnet. Aussehen je Variante steht in der Spec."
    },
    {
      "version": "1.0.0",
      "text": "Erste Version. LinkButton veraltet, ersetzt durch Button variant=ghost."
    }
  ],
  "principles": [
    {
      "id": "principles/surface-and-line",
      "text": "Trennung über Fläche und Linie. Keine Verläufe, keine Schlagschatten.",
      "why": "Verläufe und Schatten haben keine Tokens und brechen im Dark Mode.",
      "check": "no-decoration"
    },
    {
      "id": "principles/sentence-case",
      "text": "Satzschreibung. Keine Versalien per text-transform.",
      "why": "Versalien sind schwerer zu lesen und wirken wie Werbung.",
      "check": "no-uppercase"
    },
    {
      "id": "principles/action-says-what",
      "text": "Aktionen sagen, was passiert.",
      "why": "„Mehr erfahren“ oder „Hier klicken“ verraten nicht, was nach dem Klick kommt.",
      "check": "no-vague-action"
    },
    {
      "id": "principles/spacing-from-scale",
      "text": "Abstände kommen aus der Skala.",
      "why": "Zwischenwerte zerstören den Rhythmus und lassen sich nicht gemeinsam ändern.",
      "check": "no-raw-space"
    },
    {
      "id": "principles/system-controls",
      "text": "Bedienelemente kommen aus dem System, keine nackten <button> oder <input>.",
      "why": "Nur Systemkomponenten bringen Fokus, Zustände und Barrierefreiheit mit.",
      "check": "registered-only"
    }
  ],
  "vagueActions": [
    "mehr erfahren",
    "hier klicken",
    "klick hier",
    "klicken",
    "weiter",
    "ok",
    "mehr",
    "los",
    "absenden",
    "senden"
  ],
  "migrations": [
    {
      "since": "1.0.0",
      "from": "fd-link-button",
      "to": "fd-button",
      "set": {
        "variant": "ghost"
      },
      "why": "LinkButton ist veraltet."
    }
  ]
};

const P = SPEC.cssPrefix;
const log = [];
const warn = (m) => { log.push(m); console.warn(m); };
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\/ ]+/g, '-').toLowerCase();
const hex = (h) => { const n = parseInt(h.slice(1), 16); return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 }; };
const tryDo = (label, fn) => { try { return fn(); } catch (e) { warn(`${label}: ${e.message}`); } };
const specOf = (name) => SPEC.components.find((c) => c.name === name);
// Aussehen je Variante/Zustand kommt aus der Spec (components[].styles)
const style = (comp, key) => (specOf(comp).styles || {})[key] || {};

// ---------- Variablen ----------
const V = {}; // Name → Variable (semantische überschreiben gleichnamige nicht: eigene Präfixe)
let semCol, lightMode, darkMode;

function makeVar(name, col, type, scopes, desc, cssName) {
  const v = figma.variables.createVariable(name, col, type);
  v.scopes = scopes;
  if (desc) v.description = desc;
  if (cssName) tryDo(`Code-Syntax ${name}`, () => v.setVariableCodeSyntax('WEB', `var(--${P}-${cssName})`));
  V[name] = v;
  return v;
}

function buildVariables() {
  const prim = figma.variables.createVariableCollection('primitives');
  const pm = prim.modes[0].modeId;
  prim.renameMode(pm, 'value');
  for (const [hue, stops] of Object.entries(SPEC.primitives.color)) {
    for (const [stop, value] of Object.entries(stops)) {
      const v = makeVar(`color/${hue}/${stop}`, prim, 'COLOR', [], 'Primitiv. Nicht direkt verwenden.', null);
      v.hiddenFromPublishing = true;
      v.setValueForMode(pm, hex(value));
    }
  }
  for (const d of SPEC.primitives.dimension) {
    const v = makeVar(`dimension/${d}`, prim, 'FLOAT', [], 'Primitiv. Nicht direkt verwenden.', null);
    v.hiddenFromPublishing = true;
    v.setValueForMode(pm, d);
  }
  for (const s of SPEC.primitives.fontSize) makeVar(`font-size/${s}`, prim, 'FLOAT', ['FONT_SIZE'], 'Schriftgröße, gebunden in Text-Styles.', `font-size-${s}`).setValueForMode(pm, s);
  for (const l of SPEC.primitives.lineHeight) makeVar(`line-height/${l}`, prim, 'FLOAT', ['LINE_HEIGHT'], 'Zeilenhöhe, gebunden in Text-Styles.', `line-height-${l}`).setValueForMode(pm, l);

  semCol = figma.variables.createVariableCollection('semantic');
  lightMode = semCol.modes[0].modeId;
  semCol.renameMode(lightMode, 'light');
  darkMode = tryDo('Dark Mode (Tarif erlaubt evtl. nur einen Mode)', () => semCol.addMode('dark')) || null;

  for (const [name, t] of Object.entries(SPEC.semantic.color)) {
    const v = makeVar(`color/${name}`, semCol, 'COLOR', t.scopes, t.why, `color-${kebab(name)}`);
    v.setValueForMode(lightMode, figma.variables.createVariableAlias(V[`color/${t.light}`]));
    if (darkMode) v.setValueForMode(darkMode, figma.variables.createVariableAlias(V[`color/${t.dark}`]));
  }
  const floatGroup = (group, scopes) => {
    for (const [name, t] of Object.entries(SPEC.semantic[group] || {})) {
      const v = makeVar(`${group}/${name}`, semCol, 'FLOAT', scopes, t.why, `${group}-${name}`);
      const prim = V[`dimension/${t.value}`];
      const val = prim ? figma.variables.createVariableAlias(prim) : t.value;
      v.setValueForMode(lightMode, val);
      if (darkMode) v.setValueForMode(darkMode, val);
    }
  };
  floatGroup('space', ['GAP']);
  floatGroup('radius', ['CORNER_RADIUS']);
  floatGroup('border-width', ['STROKE_FLOAT']);
  floatGroup('size', ['WIDTH_HEIGHT']);
}

// ---------- Text-Styles ----------
const TS = {};
async function buildTextStyles() {
  for (const st of ['Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style: st });
  for (const t of SPEC.textStyles) {
    const s = figma.createTextStyle();
    s.name = t.name;
    s.fontName = { family: 'Inter', style: t.weight };
    s.fontSize = t.size;
    s.lineHeight = { unit: 'PIXELS', value: t.line };
    s.description = `${t.why} Code: var(--${P}-text-${kebab(t.name)})`;
    tryDo(`Bindung fontSize ${t.name}`, () => s.setBoundVariable('fontSize', V[`font-size/${t.size}`]));
    tryDo(`Bindung lineHeight ${t.name}`, () => s.setBoundVariable('lineHeight', V[`line-height/${t.line}`]));
    TS[t.name] = s;
  }
}

// ---------- Bau-Helfer ----------
const paint = (varName) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[`color/${varName}`]);
const bind = (node, field, varName) => { if (!V[varName]) { warn(`Variable fehlt: ${varName}`); return; } tryDo(`Bindung ${field}`, () => node.setBoundVariable(field, V[varName])); };
function pad(node, x, y) { bind(node, 'paddingLeft', `space/${x}`); bind(node, 'paddingRight', `space/${x}`); bind(node, 'paddingTop', `space/${y}`); bind(node, 'paddingBottom', `space/${y}`); }
function radius(node, r) { for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) bind(node, c, `radius/${r}`); }
function stroke(node, color, width = 'default') { node.strokes = [paint(color)]; node.strokeAlign = 'INSIDE'; bind(node, 'strokeWeight', `border-width/${width}`); }
function frame(name, dir, gap) { const f = figma.createFrame(); f.name = name; f.fills = []; f.layoutMode = dir; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; if (gap) bind(f, 'itemSpacing', `space/${gap}`); return f; }
function fixedWidth(node, w) { node.resize(w, 100); node.counterAxisSizingMode = 'FIXED'; node.primaryAxisSizingMode = 'AUTO'; }
async function text(chars, textStyle, color, name) { const t = figma.createText(); t.name = name || 'text'; t.fontName = { family: 'Inter', style: 'Regular' }; t.characters = chars; await t.setTextStyleIdAsync(TS[textStyle].id); t.fills = [paint(color || 'text/primary')]; return t; }
function fill(child) { tryDo('Füllbreite', () => { child.layoutSizingHorizontal = 'FILL'; }); }
async function goTo(name) { const p = figma.root.children.find((x) => x.name === name); await figma.setCurrentPageAsync(p); return p; }

// ---------- Seiten ----------
const LIVE = SPEC.components.filter((c) => c.kind === 'component' && c.status !== 'deprecated').map((c) => c.name);
const PAGES = ['📖 Lies mich', '🎨 Foundations', ...LIVE.map((n) => `🧩 ${n}`), '🧱 Patterns', '📰 Beispiele', '🗄 Veraltet'];

async function buildReadme(page) {
  const f = frame('readme', 'VERTICAL', 'lg');
  page.appendChild(f);
  fixedWidth(f, 816);
  pad(f, '3xl', '3xl'); radius(f, 'lg');
  f.fills = [paint('bg/surface')]; stroke(f, 'border/default');
  const parts = [
    [`${SPEC.name} Design System`, 'display', null, 'title'],
    [`Version ${SPEC.version} / Beispiel-Library mit Best Practices für Menschen und KI-Agenten. Erzeugt aus specs/system.json.`, 'body/md', 'text/secondary', 'version'],
    ['Zweck', 'heading/md', null, 'purpose-title'],
    ['Eine Referenz-Library, die Menschen und KI-Agenten gleich gut lesen können: Namen wie im Code, jede Entscheidung mit Begründung, keine Rohwerte.', 'body/md', null, 'purpose'],
    ['Seiten', 'heading/md', null, 'pages-title'],
    [`📖 Lies mich: diese Seite\n🎨 Foundations: semantische Farben, Abstände, Radien, Rahmenstärken, Größen, Text-Styles\n🧩 ${LIVE.join(', ')}: je eine Seite, Doku-Rahmen neben dem Set\n`+'🧱 Patterns: fertige Kompositionen wie SignInForm\n📰 Beispiele: Konto-Einstellungen in light und dark\n🗄 Veraltet: abgelöste Komponenten mit Verweis auf den Ersatz', 'body/md', null, 'pages'],
    ['Konventionen', 'heading/md', null, 'conventions-title'],
    ['• Komponenten- und Property-Namen sind identisch mit dem Code.\n• Jede Komponente hat eine Beschreibung nach festem Muster: Status, Zweck, Regeln mit ID, A11y, Spec, Code.\n• Primitive Variablen sind versteckt; gestaltet wird nur mit semantischen Variablen.\n• Jede semantische Variable hat Beschreibung, Code-Syntax (WEB) und Scope.\n• Auto Layout überall, Ebenennamen entsprechen den Props.\n• Hilfskomponenten beginnen mit _ und werden nicht veröffentlicht.\n• Zustände, die man nicht sieht (Hover, Fokus), sind eigene Varianten mit der Property state.\n• Hover und Fokus gibt es nur für disabled=false; deaktivierte Elemente haben keinen Hover und keinen Fokus.', 'body/md', null, 'conventions'],
    ['Status', 'heading/md', null, 'status-title'],
    ['stable: freigegeben\nbeta: nutzbar, API kann sich ändern\ndeprecated: nicht mehr verwenden, Ersatz steht in der Beschreibung', 'body/md', null, 'status'],
    ['Figma, Spec und Code', 'heading/md', null, 'source-title'],
    ['Gestaltet wird in dieser Datei, umgesetzt im Code. Der Vertrag dazwischen ist die Spec im Repo (specs/system.json). Das Plugin „Fundament Export“ liefert den Stand dieser Datei; der Abgleich im Repo zeigt jede Abweichung als Vorschlag für die Spec.', 'body/md', null, 'source'],
    ['Changelog', 'heading/md', null, 'changelog-title'],
    [(SPEC.changelog || []).map((e) => `${e.version}: ${e.text}`).join('\n') || `${SPEC.version}: Erste Version.`, 'body/md', null, 'changelog'],
  ];
  for (const [chars, textStyle, color, name] of parts) { const t = await text(chars, textStyle, color, name); f.appendChild(t); fill(t); }
  f.x = 0; f.y = 0;
}


// ---------- Ablauf ----------
async function main() {
  const existing = await figma.variables.getLocalVariableCollectionsAsync();
  if (existing.length) { figma.closePlugin('Abbruch: Die Datei enthält schon Variablen. Bitte in einer leeren Datei ausführen.'); return; }
  figma.notify('Lege Variablen und Text-Styles an …');
  buildVariables();
  await buildTextStyles();
  figma.root.children[0].name = PAGES[0];
  for (const n of PAGES.slice(1)) { const p = figma.createPage(); p.name = n; }
  await buildReadme(await goTo('📖 Lies mich'));
  console.log('Hinweise:', log);
  figma.closePlugin(log.length ? `Fertig mit ${log.length} Hinweisen (siehe Konsole).` : 'Fertig. Variablen, Text-Styles und Seiten sind angelegt. Komponenten jetzt in Figma bauen und mit „Fundament Export“ abgleichen.');
}

main().catch((e) => { console.error(e); figma.closePlugin(`Fehler: ${e.message}`); });
