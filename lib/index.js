'use babel';

import { CompositeDisposable } from 'atom';
import curryRight from 'lodash/fp/curryRight';

import { paint, clean, textDidChange } from './color-indent-render';

const NUMBER_OF_COLORS = 8;

export default {
  subscriptions: null,
  isVisible: false,

  config: {
    color: {
      order: 1,
      type: 'object',
      properties: {
        customColor: {
          order: 1,
          title: 'Custom color',
          type: 'color',
          default: '#00a6fb',
        },
        useDefault: {
          title: 'Use default color',
          description: '#00a6fb',
          type: 'boolean',
          default: false,
        },
      },
    },
    width: {
      order: 2,
      type: 'number',
      default: 3,
    },
  },

  initialize() {
    this.startSubscriptions();
    this.subscribeCommands();
  },

  getColorPreference(color) {
    return color.useDefault ? '#00a6fb' : color.customColor.toHexString();
  },

  getWidthPreference(width) {
    return `${width}px`;
  },

  getPreferences() {
    // Get the color from configuration
    const color = atom.config.get('color-indent.color');

    // Get the width from configuration
    const width = atom.config.get('color-indent.width');

    return {
      chosenColor: this.getColorPreference(color),
      chosenWidth: this.getWidthPreference(width),
      numberOfColors: NUMBER_OF_COLORS,
    };
  },

  activate() {
    this.isVisible = true;

    const preferences = this.getPreferences();

    // Initial paint
    this.paintAllTextEditors(preferences);

    this.subscribeToTextChange(preferences);
    this.subscribeToConfigurationChange();
  },

  deactivate() {
    this.isVisible = false;

    this.subscriptions.dispose();

    this.cleanAlltextEditors();
  },

  startSubscriptions() {
    this.subscriptions = new CompositeDisposable();
  },

  subscribeCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'color-indent:toggle': () => this.toggle(),
    }));
  },

  updatePreferences(preferences) {
    this.subscriptions.dispose();

    // Reset subscriptions
    this.startSubscriptions();

    this.cleanAlltextEditors();
    this.paintAllTextEditors(preferences);

    this.subscribeToTextChange(preferences);
    this.subscribeToConfigurationChange();
  },

  subscribeToConfigurationChange() {
    this.subscriptions.add(atom.config.onDidChange('color-indent.color', {}, (event) => {
      const chosenColor = this.getColorPreference(event.newValue);
      const preferences = this.getPreferences();

      this.updatePreferences({ chosenColor, ...preferences });
    }));

    this.subscriptions.add(atom.config.onDidChange('color-indent.width', {}, (event) => {
      const chosenWidth = this.getWidthPreference(event.newValue);
      const preferences = this.getPreferences();

      this.updatePreferences({ chosenWidth, ...preferences });
    }));
  },

  subscribeToTextChange(preferences) {
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      // Subscribe to text change
      this.subscriptions.add(textEditor.buffer.onDidChangeText(
        curryRight(textDidChange)({ textEditor, ...preferences }),
      ));

      // Subscribe to textEditor destroy
      this.subscriptions.add(textEditor.onDidDestroy(
        () => this.cleanTextEditor(textEditor),
      ));
    }));
  },

  paintAllTextEditors(preferences) {
    this.subscriptions.add(atom.workspace.observeTextEditors(
      textEditor => paint(textEditor, preferences),
    ));
  },

  cleanTextEditor(textEditor) {
    clean(textEditor);
  },

  cleanAlltextEditors() {
    atom.workspace.getTextEditors().forEach(
      textEditor => this.cleanTextEditor(textEditor),
    );
  },

  toggle() {
    if (!this.isVisible) {
      this.activate();
      return;
    }

    this.deactivate();
    // Resets the subscriptions and rebinds the toggle command
    this.initialize();
  },
};
