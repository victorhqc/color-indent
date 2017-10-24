'use babel';

import { CompositeDisposable } from 'atom';
import curryRight from 'lodash/fp/curryRight';

import { paint, clean, textDidChange } from './color-indent-render';

export default {
  subscriptions: null,
  isVisible: false,

  config: {
    color: {
      order: 1,
      type: 'string',
      default: 'blue',
      enum: [
        { value: 'blue', description: 'Blue' },
        { value: 'green', description: 'Green' },
        { value: 'safari', description: 'Safari' },
        { value: 'aquamarine', description: 'Aquamarine' },
        { value: 'midnight', description: 'Midnight' },
        { value: 'pink', description: 'Pink' },
        { value: 'purple', description: 'Purple' },
        { value: 'red', description: 'Red' },
        { value: 'orange', description: 'Orange' },
        { value: 'mustard', description: 'Mustard' },
        { value: 'custom', description: 'Custom' },
      ],
    },
    width: {
      order: 2,
      type: 'string',
      default: '3',
      enum: [
        { value: '5', description: '5px' },
        { value: '4', description: '4px' },
        { value: '3', description: '3px' },
        { value: '2', description: '2px' },
        { value: '1', description: '1px' },
        { value: 'custom', description: 'Custom' },
      ],
    },
    showGutter: {
      description: `Creates a Gutter to add a space between \`color-indent\` and the \`code\`.
disable it if you use another package that creates an additional gutter, like \`eslint\``,
      order: 3,
      type: 'boolean',
      default: true,
    },
  },

  initialize() {
    this.startSubscriptions();
    this.subscribeCommands();
  },

  getPreferences() {
    // Get the color from configuration
    const chosenColor = atom.config.get('color-indent.color');

    // Get the width from configuration
    const chosenWidth = atom.config.get('color-indent.width');

    // Should the package render a gutter?
    const showGutter = atom.config.get('color-indent.showGutter');

    return { chosenColor, chosenWidth, showGutter };
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

  updatePreferences(preferences) {
    // Remove all subscriptions
    this.subscriptions.dispose();

    // Reset subscriptions
    this.startSubscriptions();

    // Clean styles
    this.cleanAlltextEditors();
    // Repaint
    this.paintAllTextEditors(preferences);

    // Resubscribe to changes
    this.subscribeToTextChange(preferences);
    this.subscribeToConfigurationChange();
  },

  subscribeToConfigurationChange() {
    this.subscriptions.add(atom.config.onDidChange('color-indent.color', {}, (event) => {
      const chosenColor = event.newValue;
      const preferences = this.getPreferences();

      this.updatePreferences({ chosenColor, ...preferences });
    }));

    this.subscriptions.add(atom.config.onDidChange('color-indent.width', {}, (event) => {
      const chosenWidth = event.newValue;
      const preferences = this.getPreferences();

      this.updatePreferences({ chosenWidth, ...preferences });
    }));

    this.subscriptions.add(atom.config.onDidChange('color-indent.showGutter', {}, (event) => {
      const showGutter = event.newValue;
      const preferences = this.getPreferences();

      this.updatePreferences({ showGutter, ...preferences });
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
