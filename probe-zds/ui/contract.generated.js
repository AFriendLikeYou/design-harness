// Generiert aus specs/system.json – nicht von Hand bearbeiten.
export const VERSION = "0.1.0";
export const PREFIX = "z-ds";
export const ELEMENTS = {
  "z-ds-button": {
    "name": "Button",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "variant": {
        "type": "enum",
        "values": [
          "default",
          "primary",
          "zplus"
        ],
        "default": "default"
      },
      "fullwidth": {
        "type": "boolean",
        "default": false
      },
      "disabled": {
        "type": "boolean",
        "default": false
      },
      "state": {
        "type": "enum",
        "values": [
          "default",
          "hover",
          "focus"
        ],
        "default": "default"
      },
      "label": {
        "type": "text",
        "default": "Speichern"
      }
    },
    "passthrough": [
      "type",
      "name",
      "value"
    ],
    "slots": []
  },
  "z-ds-checkbox": {
    "name": "Checkbox",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "checked": {
        "type": "boolean",
        "default": false
      },
      "disabled": {
        "type": "boolean",
        "default": false
      },
      "state": {
        "type": "enum",
        "values": [
          "default",
          "hover",
          "focus"
        ],
        "default": "default"
      },
      "label": {
        "type": "text",
        "default": "Auch Angebote der ZEIT erhalten"
      },
      "helper-text": {
        "type": "text",
        "default": "Abbestellen ist jederzeit möglich."
      },
      "show-helper": {
        "type": "boolean",
        "default": false
      }
    },
    "passthrough": [
      "name",
      "value"
    ],
    "slots": []
  },
  "z-ds-toggle": {
    "name": "Toggle",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "checked": {
        "type": "boolean",
        "default": false
      },
      "state": {
        "type": "enum",
        "values": [
          "default",
          "focus"
        ],
        "default": "default"
      },
      "label": {
        "type": "text",
        "default": "Was jetzt? Der Morgenüberblick"
      },
      "helper-text": {
        "type": "text",
        "default": "Montag bis Freitag um 6 Uhr."
      },
      "show-helper": {
        "type": "boolean",
        "default": false
      }
    },
    "passthrough": [
      "name"
    ],
    "slots": []
  }
};
