'use babel';

import { CompositeDisposable } from 'atom';
import curryRight from 'lodash/fp/curryRight';

import { paint, clean, textDidChange } from './color-indent-render';

export default {
  subscriptions: null,
  isVisible: false,

  config: {
    color: {
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
  },

  initialize() {
    this.startSubscriptions();
    this.subscribeCommands();
  },

  activate() {
    this.isVisible = true;

    // Get the color from configuration
    const chosenColor = atom.config.get('color-indent.color');

    // Initial paint
    this.paintAllTextEditors(chosenColor);

    this.subscribeToTextChange(chosenColor);
    this.subscribeToConfigurationChange();
  },

  deactivate() {
    this.isVisible = false;

    this.subscriptions.dispose();

    // Get the color from configuration
    const chosenColor = atom.config.get('color-indent.color');
    this.cleanAlltextEditors(chosenColor);
  },

  startSubscriptions() {
    this.subscriptions = new CompositeDisposable();
  },

  subscribeCommands() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'color-indent:toggle': () => this.toggle(),
    }));
  },

  subscribeToTextChange(chosenColor) {
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      // Subscribe to text change
      this.subscriptions.add(textEditor.buffer.onDidChangeText(
        curryRight(textDidChange)({ textEditor, chosenColor }),
      ));

      // Subscribe to textEditor destroy
      this.subscriptions.add(textEditor.onDidDestroy(
        () => this.cleanTextEditor(textEditor),
      ));
    }));
  },

  subscribeToConfigurationChange() {
    this.subscriptions.add(atom.config.onDidChange('color-indent.color', {}, (event) => {
      const chosenColor = event.newValue;
      const previousColor = event.oldValue;

      // Remove all subscriptions
      this.subscriptions.dispose();

      // Reset subscriptions
      this.startSubscriptions();

      // Clean styles
      this.cleanAlltextEditors(previousColor);
      // Repaint
      this.paintAllTextEditors(chosenColor);

      // Resubscribe to changes
      this.subscribeToTextChange(chosenColor);
      this.subscribeToConfigurationChange();
    }));
  },

  paintAllTextEditors(chosenColor) {
    atom.workspace.getTextEditors().forEach(
      textEditor => paint(textEditor, { chosenColor }),
    );
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
