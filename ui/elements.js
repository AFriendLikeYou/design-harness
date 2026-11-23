// API der Komponenten: welche Attribute und Slots jedes Element hat. Das ist die Quelle für Props im ganzen System.
// Von Hand gepflegt, zusammen mit fundament.js. Daraus entstehen der Vertrag, das Manifest (custom-elements.json) und die Prüfung gegen Figma.
// Typen: variant = Auswahl (in Figma eine Variant-Property), text, boolean, instance = Slot (in Figma Instance-Swap),
//        behavior = Auswahl nur im Code, codeText = Text nur im Code.
export const PREFIX = "fd";
export const PACKAGE = "@fundament/ui";
export const COMPONENTS = {
  Button: {
    props: [
      {
        name: "variant",
        type: "variant",
        values: [
          "primary",
          "secondary",
          "ghost",
          "danger"
        ],
        default: "primary"
      },
      {
        name: "size",
        type: "variant",
        values: [
          "md",
          "sm"
        ],
        default: "md"
      },
      {
        name: "disabled",
        type: "variant",
        values: [
          "false",
          "true"
        ],
        default: "false"
      },
      {
        name: "state",
        type: "variant",
        values: [
          "default",
          "hover",
          "focus"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "Speichern"
      }
    ],
    passthrough: [
      "type",
      "name",
      "value"
    ]
  },
  TextField: {
    props: [
      {
        name: "state",
        type: "variant",
        values: [
          "default",
          "focus",
          "error",
          "disabled"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "E-Mail-Adresse"
      },
      {
        name: "value",
        type: "text",
        default: "name@beispiel.de"
      },
      {
        name: "helperText",
        type: "text",
        default: "Wir senden dir einen Bestätigungslink."
      },
      {
        name: "showHelper",
        type: "boolean",
        default: true
      },
      {
        name: "errorText",
        type: "text",
        default: "Bitte gib eine gültige E-Mail-Adresse ein."
      },
      {
        name: "showTrailing",
        type: "boolean",
        default: false
      },
      {
        name: "trailing",
        type: "instance",
        default: "Button"
      },
      {
        name: "trailingAction",
        type: "behavior",
        values: [
          "none",
          "reveal",
          "clear"
        ],
        default: "none"
      }
    ],
    passthrough: [
      "name",
      "type",
      "autocomplete",
      "inputmode",
      "required"
    ]
  },
  Checkbox: {
    props: [
      {
        name: "checked",
        type: "variant",
        values: [
          "false",
          "true"
        ],
        default: "false"
      },
      {
        name: "disabled",
        type: "variant",
        values: [
          "false",
          "true"
        ],
        default: "false"
      },
      {
        name: "state",
        type: "variant",
        values: [
          "default",
          "focus"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "Angemeldet bleiben"
      },
      {
        name: "helperText",
        type: "text",
        default: "Du kannst das später ändern."
      },
      {
        name: "showHelper",
        type: "boolean",
        default: false
      }
    ],
    passthrough: [
      "name",
      "value"
    ]
  },
  Switch: {
    props: [
      {
        name: "checked",
        type: "variant",
        values: [
          "false",
          "true"
        ],
        default: "false"
      },
      {
        name: "disabled",
        type: "variant",
        values: [
          "false",
          "true"
        ],
        default: "false"
      },
      {
        name: "state",
        type: "variant",
        values: [
          "default",
          "focus"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "E-Mail-Benachrichtigungen"
      },
      {
        name: "helperText",
        type: "text",
        default: "Wir schreiben dir höchstens einmal pro Woche."
      },
      {
        name: "showHelper",
        type: "boolean",
        default: false
      }
    ],
    passthrough: [
      "name"
    ]
  },
  Badge: {
    props: [
      {
        name: "tone",
        type: "variant",
        values: [
          "neutral",
          "info",
          "success",
          "warning",
          "danger"
        ],
        default: "neutral"
      },
      {
        name: "label",
        type: "text",
        default: "Neu"
      }
    ]
  },
  Alert: {
    props: [
      {
        name: "tone",
        type: "variant",
        values: [
          "info",
          "success",
          "warning",
          "danger"
        ],
        default: "info"
      },
      {
        name: "title",
        type: "text",
        default: "Änderungen gespeichert"
      },
      {
        name: "description",
        type: "text",
        default: "Deine Einstellungen gelten ab sofort."
      }
    ]
  },
  Card: {
    props: [
      {
        name: "title",
        type: "text",
        default: "Kartentitel"
      },
      {
        name: "body",
        type: "text",
        default: "Kurze Beschreibung des Inhalts in ein bis zwei Sätzen."
      },
      {
        name: "showFooter",
        type: "boolean",
        default: true
      },
      {
        name: "action",
        type: "instance",
        default: "Button"
      },
      {
        name: "showBadge",
        type: "boolean",
        default: false
      },
      {
        name: "badge",
        type: "instance",
        default: "Badge"
      }
    ]
  },
  Link: {
    props: [
      {
        name: "state",
        type: "variant",
        values: [
          "default",
          "hover",
          "focus"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "Alle Rechnungen ansehen"
      }
    ],
    passthrough: [
      "href",
      "target",
      "rel"
    ]
  },
  SignInForm: {
    props: []
  },
  ConfirmAction: {
    props: [
      {
        name: "word",
        type: "codeText",
        default: "LÖSCHEN"
      },
      {
        name: "fieldLabel",
        type: "codeText",
        default: "Gib zur Bestätigung LÖSCHEN ein"
      },
      {
        name: "actionLabel",
        type: "codeText",
        default: "Konto endgültig löschen"
      }
    ]
  },
  Chip: {
    props: [
      { name: "selected", type: "variant", values: ["false", "true"], default: "false" },
      { name: "disabled", type: "variant", values: ["false", "true"], default: "false" },
      { name: "state", type: "variant", values: ["default", "hover", "focus"], default: "default" },
      { name: "label", type: "text", default: "Kostenlos" }
    ],
    passthrough: ["name", "value"]
  },
  LinkButton: {
    props: [
      {
        name: "label",
        type: "text",
        default: "Mehr"
      }
    ]
  }
};
