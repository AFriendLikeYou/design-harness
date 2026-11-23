// API der Komponenten der ZDS-Probe: Attribute und Slots je Element. Quelle für Props; von Hand gepflegt.
// Typen wie in Fundament: variant, text, boolean, instance (Slot), behavior, codeText.
export const PREFIX = "z-ds";
export const PACKAGE = "@zeit/zds-probe";
export const COMPONENTS = {
  Button: {
    props: [
      {
        name: "variant",
        type: "variant",
        values: [
          "default",
          "primary",
          "zplus"
        ],
        default: "default"
      },
      {
        name: "fullwidth",
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
          "hover",
          "focus"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "Auch Angebote der ZEIT erhalten"
      },
      {
        name: "helperText",
        type: "text",
        default: "Abbestellen ist jederzeit möglich."
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
  Toggle: {
    impl: "Switch",
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
        default: "Was jetzt? Der Morgenüberblick"
      },
      {
        name: "helperText",
        type: "text",
        default: "Montag bis Freitag um 6 Uhr."
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
  Input: {
    impl: "TextField",
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
        default: "Wir schicken dir einen Bestätigungslink."
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
  TextButton: {
    impl: "Button",
    props: [
      {
        name: "size",
        type: "variant",
        values: [
          "default",
          "slim",
          "large"
        ],
        default: "default"
      },
      {
        name: "bold",
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
          "hover",
          "focus"
        ],
        default: "default"
      },
      {
        name: "label",
        type: "text",
        default: "Merken"
      }
    ],
    passthrough: [
      "type",
      "name",
      "value"
    ]
  }
};
