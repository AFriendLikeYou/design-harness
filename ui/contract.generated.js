// Generiert aus specs/system.json – nicht von Hand bearbeiten.
export const VERSION = "1.3.0";
export const ELEMENTS = {
  "fd-button": {
    "name": "Button",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "variant": {
        "type": "enum",
        "values": [
          "primary",
          "secondary",
          "ghost",
          "danger"
        ],
        "default": "primary"
      },
      "size": {
        "type": "enum",
        "values": [
          "md",
          "sm"
        ],
        "default": "md"
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
  "fd-text-field": {
    "name": "TextField",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "state": {
        "type": "enum",
        "values": [
          "default",
          "focus",
          "error",
          "disabled"
        ],
        "default": "default"
      },
      "label": {
        "type": "text",
        "default": "E-Mail-Adresse"
      },
      "value": {
        "type": "text",
        "default": "name@beispiel.de"
      },
      "helper-text": {
        "type": "text",
        "default": "Wir senden dir einen Bestätigungslink."
      },
      "show-helper": {
        "type": "boolean",
        "default": true
      },
      "error-text": {
        "type": "text",
        "default": "Bitte gib eine gültige E-Mail-Adresse ein."
      },
      "show-trailing": {
        "type": "boolean",
        "default": false
      },
      "trailing-action": {
        "type": "enum",
        "values": [
          "none",
          "reveal",
          "clear"
        ],
        "default": "none"
      }
    },
    "passthrough": [
      "name",
      "type",
      "autocomplete",
      "inputmode",
      "required"
    ],
    "slots": [
      "trailing"
    ]
  },
  "fd-checkbox": {
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
          "focus"
        ],
        "default": "default"
      },
      "label": {
        "type": "text",
        "default": "Angemeldet bleiben"
      },
      "helper-text": {
        "type": "text",
        "default": "Du kannst das später ändern."
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
  "fd-switch": {
    "name": "Switch",
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
          "focus"
        ],
        "default": "default"
      },
      "label": {
        "type": "text",
        "default": "E-Mail-Benachrichtigungen"
      },
      "helper-text": {
        "type": "text",
        "default": "Wir schreiben dir höchstens einmal pro Woche."
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
  },
  "fd-badge": {
    "name": "Badge",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "tone": {
        "type": "enum",
        "values": [
          "neutral",
          "info",
          "success",
          "warning",
          "danger"
        ],
        "default": "neutral"
      },
      "label": {
        "type": "text",
        "default": "Neu"
      }
    },
    "passthrough": [],
    "slots": []
  },
  "fd-alert": {
    "name": "Alert",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "tone": {
        "type": "enum",
        "values": [
          "info",
          "success",
          "warning",
          "danger"
        ],
        "default": "info"
      },
      "title": {
        "type": "text",
        "default": "Änderungen gespeichert"
      },
      "description": {
        "type": "text",
        "default": "Deine Einstellungen gelten ab sofort."
      }
    },
    "passthrough": [],
    "slots": []
  },
  "fd-card": {
    "name": "Card",
    "status": "stable",
    "deprecated": null,
    "attrs": {
      "title": {
        "type": "text",
        "default": "Kartentitel"
      },
      "body": {
        "type": "text",
        "default": "Kurze Beschreibung des Inhalts in ein bis zwei Sätzen."
      },
      "show-footer": {
        "type": "boolean",
        "default": true
      },
      "show-badge": {
        "type": "boolean",
        "default": false
      }
    },
    "passthrough": [],
    "slots": [
      "action",
      "badge"
    ]
  },
  "fd-sign-in-form": {
    "name": "SignInForm",
    "status": "stable",
    "deprecated": null,
    "attrs": {},
    "passthrough": [],
    "slots": []
  },
  "fd-link-button": {
    "name": "LinkButton",
    "status": "deprecated",
    "deprecated": {
      "since": "1.0.0",
      "use": "Button variant=ghost"
    },
    "attrs": {
      "label": {
        "type": "text",
        "default": "Mehr"
      }
    },
    "passthrough": [],
    "slots": []
  }
};
