'use babel';

import ColorIndentView from './color-indent-view';
import { CompositeDisposable } from 'atom';

export default {

  colorIndentView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.colorIndentView = new ColorIndentView(state.colorIndentViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.colorIndentView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'color-indent:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.colorIndentView.destroy();
  },

  serialize() {
    return {
      colorIndentViewState: this.colorIndentView.serialize()
    };
  },

  toggle() {
    console.log('ColorIndent was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
