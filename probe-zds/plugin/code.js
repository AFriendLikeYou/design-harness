// Fundament Start – legt in einer leeren Figma-Datei das Fundament an: Variablen, Text-Styles, Seiten und die Seite „Lies mich“.
// Komponenten baut das Plugin bewusst nicht. Sie entstehen in Figma; der Abgleich (Plugin „Fundament Export“ + node tooling/figma-diff.mjs)
// hält sie mit der Spec gleich. Generiert aus specs/system.json. Nicht von Hand bearbeiten, sondern Spec ändern und neu bauen.
const SPEC = {
  "name": "ZDS-Probe",
  "version": "0.2.0",
  "cssPrefix": "z-ds",
  "codePackage": "@zeit/zds-probe",
  "fontFamily": "\"Tablet Gothic\", TabletGothic, system-ui, sans-serif",
  "$hinweis": "Probe: drei echte ZDS-Komponenten (Button, Checkbox, Toggle) im Schema von Fundament. Farben und Abstände tragen die echten ZDS-Namen und Werte (hell und dunkel aus packages/tokens/dist/styles-zds.css, Stand 22.11.2026). Radius-, Größen- und Textnamen folgen dem Fundament-Schema und weichen von ZDS ab. Regeln mit „herkunft“ stammen nicht aus der ZDS-Doku.",
  "primitives": {
    "color": {
      "light": {
        "background-0": "#ffffff",
        "background-10": "#eeeeee",
        "background-20": "#dfdfe1",
        "text-100": "#252525",
        "text-70": "#444444",
        "text-40": "#999999",
        "border-100": "#cccccf",
        "border-70": "#e4e4e4",
        "accent-100": "#b91109",
        "accent-70": "#880d07",
        "focus-100": "#005fcc",
        "general-white-100": "#ffffff",
        "text-55": "#69696c",
        "error-70": "#bf4040"
      },
      "dark": {
        "background-0": "#121212",
        "background-10": "#232323",
        "background-20": "#2e2e2e",
        "text-100": "#ffffff",
        "text-70": "#bababa",
        "text-40": "#8b8b8b",
        "border-100": "#363636",
        "border-70": "#2e2e2e",
        "accent-100": "#eb362e",
        "accent-70": "#880d07",
        "focus-100": "#54a3fe",
        "general-white-100": "#ffffff",
        "text-55": "#999999",
        "error-70": "#f13638"
      }
    },
    "dimension": [
      0,
      1,
      2,
      4,
      6,
      8,
      10,
      12,
      16,
      20,
      24,
      26,
      32,
      44,
      48,
      292,
      360
    ],
    "fontSize": [
      12,
      14,
      16,
      20,
      28
    ],
    "lineHeight": [
      16,
      20,
      24,
      32
    ]
  },
  "semantic": {
    "color": {
      "background/0": {
        "light": "light/background-0",
        "dark": "dark/background-0",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL",
          "TEXT_FILL"
        ],
        "why": "Seitengrund und Fläche der Checkbox. Beschriftung des Primary-Buttons.",
        "zds": "--z-ds-color-background-0"
      },
      "background/10": {
        "light": "light/background-10",
        "dark": "dark/background-10",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Fläche des Default-Buttons, Hover-Fläche der Checkbox.",
        "zds": "--z-ds-color-background-10"
      },
      "background/20": {
        "light": "light/background-20",
        "dark": "dark/background-20",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Hover-Fläche des Default-Buttons, Bahn des Toggles im Aus-Zustand.",
        "zds": "--z-ds-color-background-20"
      },
      "text/100": {
        "light": "light/text-100",
        "dark": "dark/text-100",
        "scopes": [
          "TEXT_FILL",
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Text. Fläche des Primary-Buttons, der angehakten Checkbox und des Toggles im An-Zustand.",
        "zds": "--z-ds-color-text-100"
      },
      "text/70": {
        "light": "light/text-70",
        "dark": "dark/text-70",
        "scopes": [
          "TEXT_FILL",
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Sekundärer Text. Hover-Fläche des Primary-Buttons und der angehakten Checkbox.",
        "zds": "--z-ds-color-text-70"
      },
      "text/40": {
        "light": "light/text-40",
        "dark": "dark/text-40",
        "scopes": [
          "TEXT_FILL",
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Deaktivierter Text und deaktivierte angehakte Checkbox. Muss keinen Kontrast erfüllen.",
        "zds": "--z-ds-color-text-40"
      },
      "border/100": {
        "light": "light/border-100",
        "dark": "dark/border-100",
        "scopes": [
          "STROKE_COLOR"
        ],
        "why": "Rahmen der Checkbox.",
        "zds": "--z-ds-color-border-100"
      },
      "border/70": {
        "light": "light/border-70",
        "dark": "dark/border-70",
        "scopes": [
          "STROKE_COLOR"
        ],
        "why": "Rahmen der deaktivierten Checkbox.",
        "zds": "--z-ds-color-border-70"
      },
      "accent/100": {
        "light": "light/accent-100",
        "dark": "dark/accent-100",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "ZEIT-Rot. Fläche des Z+-Buttons.",
        "zds": "--z-ds-color-accent-100"
      },
      "accent/70": {
        "light": "light/accent-70",
        "dark": "dark/accent-70",
        "scopes": [
          "FRAME_FILL",
          "SHAPE_FILL"
        ],
        "why": "Hover-Fläche des Z+-Buttons.",
        "zds": "--z-ds-color-accent-70"
      },
      "focus/100": {
        "light": "light/focus-100",
        "dark": "dark/focus-100",
        "scopes": [
          "STROKE_COLOR"
        ],
        "why": "Fokus-Outline, 2 px.",
        "zds": "--z-ds-color-focus-100"
      },
      "general/white-100": {
        "light": "light/general-white-100",
        "dark": "dark/general-white-100",
        "scopes": [
          "TEXT_FILL",
          "SHAPE_FILL",
          "STROKE_COLOR"
        ],
        "why": "Festes Weiß: Beschriftung des Z+-Buttons, Haken der Checkbox, Knopf des Toggles.",
        "zds": "--z-ds-color-general-white-100"
      },
      "text/55": {
        "light": "light/text-55",
        "dark": "dark/text-55",
        "scopes": [
          "TEXT_FILL",
          "STROKE_COLOR"
        ],
        "why": "Platzhalter im Input. Rahmen des Inputs im Fokus.",
        "zds": "--z-ds-color-text-55"
      },
      "error/70": {
        "light": "light/error-70",
        "dark": "dark/error-70",
        "scopes": [
          "STROKE_COLOR",
          "TEXT_FILL"
        ],
        "why": "Rahmen des Inputs im Fehlerzustand; in der Probe auch der Fehlertext.",
        "zds": "--z-ds-color-error-70"
      }
    },
    "space": {
      "2": {
        "value": 2,
        "why": "Abstand des Toggle-Knopfs zum Rand."
      },
      "4": {
        "value": 4,
        "why": "Feinabstand."
      },
      "6": {
        "value": 6,
        "why": "Innenabstand des schmalen Text-Buttons vertikal (--z-ds-space-6)."
      },
      "8": {
        "value": 8,
        "why": "Abstand zwischen Bedienelement und Beschriftung."
      },
      "10": {
        "value": 10,
        "why": "Innenabstand Button vertikal (--z-ds-space-10)."
      },
      "12": {
        "value": 12,
        "why": "Innenabstand des Inputs horizontal (--z-ds-space-s)."
      },
      "16": {
        "value": 16,
        "why": "Innenabstand Button horizontal (--z-ds-space-16)."
      },
      "24": {
        "value": 24,
        "why": "Abstand zwischen Gruppen."
      },
      "32": {
        "value": 32,
        "why": "Abstand zwischen Abschnitten."
      },
      "48": {
        "value": 48,
        "why": "Seitenrand."
      }
    },
    "radius": {
      "2": {
        "value": 2,
        "why": "Checkbox (--z-ds-border-radius-2)."
      },
      "4": {
        "value": 4,
        "why": "Button (--z-ds-border-radius-4)."
      },
      "full": {
        "value": 999,
        "why": "Toggle."
      }
    },
    "border-width": {
      "default": {
        "value": 1,
        "why": "Rahmen der Checkbox."
      },
      "strong": {
        "value": 2,
        "why": "Fokus-Outline und Haken."
      }
    },
    "size": {
      "checkbox": {
        "value": 16,
        "why": "Kantenlänge der Checkbox."
      },
      "toggle-width": {
        "value": 26,
        "why": "Breite der Toggle-Bahn."
      },
      "toggle-thumb": {
        "value": 12,
        "why": "Durchmesser des Toggle-Knopfs."
      },
      "touch-target": {
        "value": 44,
        "why": "Mindesthöhe der Klickzeile aus Bedienelement und Beschriftung (Fundament-Regel)."
      },
      "panel": {
        "value": 360,
        "why": "Höchstbreite schmaler Module (Annahme der Probe)."
      },
      "input": {
        "value": 292,
        "why": "Vorschaubreite des Inputs laut ZDS; im Layout füllt er seinen Container."
      }
    }
  },
  "textStyles": [
    {
      "name": "display",
      "size": 28,
      "line": 32,
      "weight": "Bold",
      "why": "Modultitel (Annahme der Probe)."
    },
    {
      "name": "heading/lg",
      "size": 20,
      "line": 24,
      "weight": "Bold",
      "why": "Abschnittstitel (Annahme der Probe)."
    },
    {
      "name": "heading/md",
      "size": 16,
      "line": 20,
      "weight": "Bold",
      "why": "Gruppentitel (Annahme der Probe)."
    },
    {
      "name": "body/md",
      "size": 16,
      "line": 20,
      "weight": "Regular",
      "why": "Fließtext und Beschriftungen (Annahme der Probe)."
    },
    {
      "name": "body/sm",
      "size": 14,
      "line": 20,
      "weight": "Regular",
      "why": "Hilfstext (Annahme der Probe)."
    },
    {
      "name": "label/md",
      "size": 16,
      "line": 20,
      "weight": "Bold",
      "why": "Beschriftung des Buttons: Tablet Gothic Bold 16, Zeilenhöhe 20 (aus button.css)."
    },
    {
      "name": "label/sm",
      "size": 14,
      "line": 20,
      "weight": "Bold",
      "why": "Kleine Beschriftung (Annahme der Probe)."
    },
    {
      "name": "caption",
      "size": 12,
      "line": 16,
      "weight": "Regular",
      "why": "Metadaten (Annahme der Probe)."
    }
  ],
  "contrast": [
    {
      "fg": "text/100",
      "on": [
        "background/0",
        "background/10",
        "background/20"
      ],
      "min": 4.5,
      "why": "Text und Beschriftung des Default-Buttons"
    },
    {
      "fg": "text/70",
      "on": [
        "background/0"
      ],
      "min": 4.5,
      "why": "Hilfstext"
    },
    {
      "fg": "background/0",
      "on": [
        "text/100",
        "text/70"
      ],
      "min": 4.5,
      "why": "Beschriftung des Primary-Buttons, auch im Hover"
    },
    {
      "fg": "general/white-100",
      "on": [
        "accent/100"
      ],
      "min": 4.5,
      "why": "Beschriftung des Z+-Buttons",
      "accept": "Im Dark Mode liegt Weiß auf #eb362e unter 4,5:1. Offen für ZDS."
    },
    {
      "fg": "general/white-100",
      "on": [
        "accent/70"
      ],
      "min": 4.5,
      "why": "Beschriftung des Z+-Buttons im Hover"
    },
    {
      "fg": "general/white-100",
      "on": [
        "text/100"
      ],
      "min": 3,
      "why": "Haken der Checkbox, Knopf des Toggles im An-Zustand",
      "accept": "Im Dark Mode ist text/100 selbst Weiß: Haken und Knopf sind dann nicht sichtbar. Offen für ZDS."
    },
    {
      "fg": "border/100",
      "on": [
        "background/0"
      ],
      "min": 3,
      "why": "Rahmen der Checkbox",
      "accept": "Border/100 erreicht rund 1,6:1 statt 3:1 (WCAG 1.4.11). Bekannter offener Punkt im ZDS."
    },
    {
      "fg": "background/20",
      "on": [
        "background/0"
      ],
      "min": 3,
      "why": "Toggle-Bahn im Aus-Zustand gegen den Seitengrund",
      "accept": "Die Bahn hebt sich mit rund 1,3:1 kaum vom Grund ab (WCAG 1.4.11). Offen für ZDS."
    },
    {
      "fg": "focus/100",
      "on": [
        "background/0"
      ],
      "min": 3,
      "why": "Fokus-Outline"
    },
    {
      "fg": "text/55",
      "on": [
        "background/0"
      ],
      "min": 4.5,
      "why": "Platzhalter im Input"
    },
    {
      "fg": "error/70",
      "on": [
        "background/0"
      ],
      "min": 4.5,
      "why": "Fehlertext unter dem Input (Probe)"
    },
    {
      "fg": "text/70",
      "on": [
        "background/10"
      ],
      "min": 4.5,
      "why": "Text-Button im Ruhezustand auf getönter Fläche"
    }
  ],
  "components": [
    {
      "name": "Button",
      "kind": "component",
      "status": "stable",
      "version": "0.1.0",
      "purpose": "Löst eine Aktion aus.",
      "zds": {
        "klasse": "z-button",
        "quelle": "packages/components/src/button"
      },
      "props": [
        {
          "name": "variant",
          "type": "variant",
          "values": [
            "default",
            "primary",
            "zplus"
          ],
          "default": "default"
        },
        {
          "name": "fullwidth",
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
      "styles": {
        "variant=default": {
          "bg": "background/10",
          "fg": "text/100"
        },
        "variant=default, state=hover": {
          "bg": "background/20"
        },
        "variant=primary": {
          "bg": "text/100",
          "fg": "background/0"
        },
        "variant=primary, state=hover": {
          "bg": "text/70"
        },
        "variant=zplus": {
          "bg": "accent/100",
          "fg": "general/white-100"
        },
        "variant=zplus, state=hover": {
          "bg": "accent/70"
        },
        "state=focus": {
          "ring": "focus/100",
          "ringWidth": "strong"
        }
      },
      "rules": [
        {
          "id": "button/one-primary",
          "text": "Höchstens ein Primary-Button pro Ansicht.",
          "why": "Mehrere primäre Aktionen konkurrieren um Aufmerksamkeit.",
          "check": "max-per-view",
          "herkunft": "Fundament-Regel, für ZDS noch zu bestätigen"
        },
        {
          "id": "button/label-verb",
          "text": "Beschriftung beginnt mit einem Verb und nennt das Ergebnis.",
          "why": "Man weiß vor dem Klick, was passiert.",
          "check": null,
          "herkunft": "Fundament-Regel, für ZDS noch zu bestätigen"
        },
        {
          "id": "button/zplus-only-paid",
          "text": "variant=zplus nur für den Weg zu Z+-Inhalten oder zum Abo.",
          "why": "ZEIT-Rot ist die Farbe des Bezahlangebots; überall sonst verliert es diese Bedeutung.",
          "check": null,
          "herkunft": "Annahme der Probe aus dem Variantennamen, für ZDS noch zu bestätigen"
        }
      ],
      "a11y": "Als <button> umsetzen. :focus-visible zeigt eine 2-px-Outline in focus/100. Deaktiviert senkt die Deckkraft auf 50 %.",
      "do": [
        "„Einstellungen speichern“"
      ],
      "dont": [
        "„Click me“",
        "Zwei Primary-Buttons nebeneinander"
      ]
    },
    {
      "name": "Checkbox",
      "kind": "component",
      "status": "stable",
      "version": "0.1.0",
      "purpose": "Auswahl einer unabhängigen Option.",
      "zds": {
        "klasse": "z-checkbox",
        "quelle": "packages/components/src/checkbox"
      },
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
            "hover",
            "focus"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "Auch Angebote der ZEIT erhalten"
        },
        {
          "name": "helperText",
          "type": "text",
          "default": "Abbestellen ist jederzeit möglich."
        },
        {
          "name": "showHelper",
          "type": "boolean",
          "default": false
        }
      ],
      "styles": {
        "checked=false": {
          "bg": "background/0",
          "border": "border/100",
          "borderWidth": "default",
          "fg": "text/100",
          "helper": "text/70"
        },
        "checked=false, state=hover": {
          "bg": "background/10"
        },
        "checked=true": {
          "bg": "text/100",
          "mark": "general/white-100"
        },
        "checked=true, state=hover": {
          "bg": "text/70"
        },
        "state=focus": {
          "ring": "focus/100",
          "ringWidth": "strong"
        },
        "disabled=true": {
          "border": "border/70",
          "fg": "text/40"
        },
        "checked=true, disabled=true": {
          "bg": "text/40"
        }
      },
      "rules": [
        {
          "id": "checkbox/needs-label",
          "text": "Die Checkbox hat immer eine sichtbare Beschriftung; sie gehört zur Klickfläche.",
          "why": "Die ZDS-Checkbox ist als Kästchen von 16 px dokumentiert. Allein ist sie zu klein und hat keinen Namen.",
          "check": "required-prop",
          "herkunft": "Lücke der ZDS-Doku, in der Probe ergänzt"
        },
        {
          "id": "checkbox/disabled-reason",
          "text": "Ist die Checkbox deaktiviert, erklärt helperText den Grund.",
          "why": "Ohne Erklärung wirkt ein deaktiviertes Element wie ein Fehler.",
          "check": "required-when-disabled",
          "herkunft": "Fundament-Regel, für ZDS noch zu bestätigen"
        }
      ],
      "a11y": "Natives <input type=\"checkbox\"> in einem <label>. Die ZDS-Doku beschreibt nur ein <span>; das ist nicht bedienbar.",
      "do": [
        "Kurze Beschriftung in Satzschreibung"
      ],
      "dont": [
        "Kästchen ohne Beschriftung"
      ]
    },
    {
      "name": "Toggle",
      "kind": "component",
      "status": "stable",
      "version": "0.1.0",
      "purpose": "Schaltet eine Einstellung sofort ein oder aus.",
      "zds": {
        "klasse": "z-switch",
        "quelle": "packages/components/src/toggle"
      },
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
          "default": "Was jetzt? Der Morgenüberblick"
        },
        {
          "name": "helperText",
          "type": "text",
          "default": "Montag bis Freitag um 6 Uhr."
        },
        {
          "name": "showHelper",
          "type": "boolean",
          "default": false
        }
      ],
      "styles": {
        "checked=false": {
          "bg": "background/20",
          "thumb": "general/white-100",
          "fg": "text/100",
          "helper": "text/70"
        },
        "checked=true": {
          "bg": "text/100"
        },
        "state=focus": {
          "ring": "focus/100",
          "ringWidth": "strong"
        }
      },
      "rules": [
        {
          "id": "toggle/needs-label",
          "text": "Der Toggle hat immer eine sichtbare Beschriftung; sie gehört zur Klickfläche.",
          "why": "Die Bahn misst 26 × 16 px und ist allein zu klein. Die ZDS-Doku behilft sich mit aria-label.",
          "check": "required-prop",
          "herkunft": "Lücke der ZDS-Doku, in der Probe ergänzt"
        },
        {
          "id": "toggle/immediate",
          "text": "Nur für Einstellungen, die sofort wirken.",
          "why": "Ein Schalter verspricht, dass die Änderung schon gilt.",
          "check": null,
          "herkunft": "Fundament-Regel, für ZDS noch zu bestätigen"
        }
      ],
      "a11y": "Als <button role=\"switch\"> mit aria-checked. Einen deaktivierten Zustand gibt es im ZDS nicht.",
      "do": [
        "Beschriftung nennt die Einstellung"
      ],
      "dont": [
        "„An“ oder „Aus“ als Beschriftung"
      ],
      "impl": "Switch"
    },
    {
      "name": "Input",
      "impl": "TextField",
      "kind": "component",
      "status": "stable",
      "version": "0.1.0",
      "purpose": "Einzeilige Texteingabe.",
      "zds": {
        "klasse": "z-input",
        "quelle": "packages/components/src/input"
      },
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
          "default": "Wir schicken dir einen Bestätigungslink."
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
        }
      ],
      "styles": {
        "state=default": {
          "bg": "background/0",
          "fg": "text/100",
          "border": "border/100",
          "borderWidth": "default",
          "helper": "text/70"
        },
        "state=focus": {
          "border": "text/55"
        },
        "state=error": {
          "border": "error/70",
          "helper": "error/70"
        },
        "state=disabled": {
          "fg": "text/40"
        }
      },
      "rules": [
        {
          "id": "input/visible-label",
          "text": "Der Input hat immer eine sichtbare Beschriftung.",
          "why": "Das ZDS dokumentiert den Input nur mit Platzhalter und aria-label. Platzhalter verschwinden beim Tippen.",
          "check": "required-prop",
          "herkunft": "Lücke der ZDS-Doku, in der Probe ergänzt"
        },
        {
          "id": "input/error-text",
          "text": "Im Fehlerzustand erklärt errorText, wie man den Fehler behebt.",
          "why": "Das ZDS färbt nur den Rahmen. Rot allein sagt nicht, was zu tun ist.",
          "check": null,
          "herkunft": "Lücke der ZDS-Doku, in der Probe ergänzt"
        }
      ],
      "a11y": "<label for> mit dem Feld verknüpfen, Fehlertext per aria-describedby, Fehler mit aria-invalid. Der Fokus zeigt sich im ZDS nur als dunklerer Rahmen; die Extras Leading Icon und Dropdown sind in der Probe nicht übertragen.",
      "do": [
        "Beschriftung über dem Feld"
      ],
      "dont": [
        "Platzhalter als einzige Beschriftung"
      ]
    },
    {
      "name": "TextButton",
      "impl": "Button",
      "kind": "component",
      "status": "stable",
      "version": "0.1.0",
      "purpose": "Zurückhaltende Aktion ohne Fläche, etwa in Leisten und neben Inhalten.",
      "zds": {
        "klasse": "z-text-button",
        "quelle": "packages/components/src/text-button"
      },
      "props": [
        {
          "name": "size",
          "type": "variant",
          "values": [
            "default",
            "slim",
            "large"
          ],
          "default": "default"
        },
        {
          "name": "bold",
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
            "hover",
            "focus"
          ],
          "default": "default"
        },
        {
          "name": "label",
          "type": "text",
          "default": "Merken"
        }
      ],
      "styles": {
        "state=default": {
          "fg": "text/70"
        },
        "state=hover": {
          "bg": "background/10",
          "fg": "text/100"
        },
        "state=focus": {
          "ring": "focus/100",
          "ringWidth": "strong"
        }
      },
      "rules": [
        {
          "id": "textbutton/label-verb",
          "text": "Beschriftung beginnt mit einem Verb und nennt das Ergebnis.",
          "why": "Man weiß vor dem Klick, was passiert.",
          "check": null,
          "herkunft": "Fundament-Regel, für ZDS noch zu bestätigen"
        }
      ],
      "a11y": "Als <button> umsetzen. Die Variante On Image des ZDS ist in der Probe nicht übertragen.",
      "do": [
        "„Merken“",
        "„Teilen“"
      ],
      "dont": [
        "Text-Button als Hauptaktion einer Seite"
      ]
    }
  ],
  "principles": [
    {
      "id": "principles/surface-and-line",
      "text": "Trennung über Fläche und Linie. Keine Verläufe, keine Schlagschatten.",
      "why": "Verläufe und Schatten haben keine Tokens.",
      "check": "no-decoration"
    },
    {
      "id": "principles/sentence-case",
      "text": "Satzschreibung. Keine Versalien per text-transform.",
      "why": "Hausregel.",
      "check": "no-uppercase"
    },
    {
      "id": "principles/action-says-what",
      "text": "Aktionen sagen, was passiert.",
      "why": "„Mehr erfahren“ verrät nicht, was nach dem Klick kommt.",
      "check": "no-vague-action"
    },
    {
      "id": "principles/spacing-from-scale",
      "text": "Abstände kommen aus der Skala.",
      "why": "Zwischenwerte lassen sich nicht gemeinsam ändern.",
      "check": "no-raw-space"
    },
    {
      "id": "principles/system-controls",
      "text": "Bedienelemente kommen aus dem System.",
      "why": "Nur Systemkomponenten bringen Fokus und Zustände mit.",
      "check": "registered-only"
    }
  ],
  "vagueActions": [
    "mehr erfahren",
    "hier klicken",
    "klick hier",
    "klicken",
    "click me",
    "weiter",
    "ok",
    "mehr",
    "los",
    "absenden",
    "senden"
  ],
  "migrations": [],
  "changelog": [
    {
      "version": "0.2.0",
      "text": "Input und Text-Button aufgenommen."
    },
    {
      "version": "0.1.0",
      "text": "Probe mit Button, Checkbox und Toggle aus dem ZDS."
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
