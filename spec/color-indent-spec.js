'use babel';

import pSBC from 'shade-blend-color';
import {
  openTestFile,
  activatePackage,
  togglePackage,
} from './helpers';

const indentedText = `color 0
  color 1
    color 2
      color 3
        color 4
          color 4 again`;

const notIndentedText = `color 0
color 0
color 0
color 0`;

const indentedLine = '        indentation of 4';

const nonIndentedLine = 'indentation of 0';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('ColorIndent', () => {
  beforeEach(() => {
    waitsForPromise(() => openTestFile(atom));
    atom.packages.triggerDeferredActivationHooks();
    waitsForPromise(() => atom.updateProcessEnvAndTriggerHooks());
    waitsForPromise(() => activatePackage(atom));
  });

  describe('Toggle Package', () => {
    it('Should activate package', () => {
      expect(atom.packages.isPackageActive('color-indent')).toBeTruthy();
    });

    it('Should remove all paint toggling the package', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      const numberOfLines = editor.getLineCount();
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines);

      // Toggles off
      togglePackage(atom);

      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(0);
    });

    it('Should repaint after toggling package', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      const numberOfLines = editor.getLineCount();
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines);

      // Toggles off
      togglePackage(atom);
      // Toggles on
      togglePackage(atom);

      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines);
    });

    it('Shoud not paint text once package is toggled off', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);

      // Toggles off
      togglePackage(atom);

      // Adds 2 tabulations
      const textToInsert = '    tabulation of 3';
      editor.setTextInBufferRange([[1, 0], [1, 22]], textToInsert);

      // Adds 3 tabulations
      const textToInsert2 = '      tabulation of 4';
      editor.setTextInBufferRange([[2, 0], [2, 21]], textToInsert2);

      // Sets the cursor at the last line
      editor.setCursorScreenPosition([5, 26]);
      editor.insertNewline();
      editor.insertText('Hey');

      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(0);
    });

    it('Should paint text once package is toggled back on', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(notIndentedText);
      const numberOfLines = editor.getLineCount();

      // Toggles off
      togglePackage(atom);
      // Toggles on
      togglePackage(atom);

      // Adds 2 tabulations
      const textToInsert = '    tabulation of 3';
      editor.setTextInBufferRange([[4, 0], [4, 21]], textToInsert);

      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines);
    });
  });

  describe('Changing text', () => {
    it('Should update paint in multiple lines', () => {
      const editor = atom.workspace.getActiveTextEditor();

      editor.setText(indentedText);
      editor.setText(indentedText);
      editor.setText(indentedText);

      // Should have the same amount of markers than the number of lines.
      const numberOfLines = editor.getLineCount();
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines);

      // There should be 1 style for zero indentation.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 0,
      }).length).toBe(1);

      // There should be 1 style for one indentation.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 1,
      }).length).toBe(1);

      // There should be 1 style for two indentation.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 2,
      }).length).toBe(1);

      // There should be 1 style for three indentation.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 3,
      }).length).toBe(1);

      // There should be 1 style for four indentation.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 4,
      }).length).toBe(1);
    });

    it('Should update when editing current line', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(notIndentedText);

      // Adds 2 tabulations
      const textToInsert = '    tabulation of 2';
      editor.setTextInBufferRange([[1, 0], [1, 21]], textToInsert);

      // Should be 3 markers of 0 tabulations.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 0,
      }).length).toBe(3);
      // Should be 1 marker of 2 tabulations.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 2,
      }).length).toBe(1);

      // Adds another tabulation in another line
      const textToInsert2 = '  tabulation of 1';
      editor.setTextInBufferRange([[2, 0], [2, 21]], textToInsert2);

      // Should be 2 markers of 0 tabulations.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 0,
      }).length).toBe(2);
      // Should be 1 marker of 2 tabulations.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 2,
      }).length).toBe(1);

      // Should be 1 marker of 1 tabulations.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 1,
      }).length).toBe(1);
    });

    it('Should handle inserting lines in the middle of text', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(notIndentedText);

      // Inserts several new lines
      editor.setCursorScreenPosition([1, 0]);
      editor.insertNewlineBelow();
      editor.insertNewlineBelow();
      editor.insertNewlineBelow();
      editor.insertNewlineBelow();
      editor.insertNewlineBelow();
      editor.insertNewlineBelow();

      const numberOfLines = editor.getLineCount();
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines);
    });

    it('Should handle changing indentation in text', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(notIndentedText);

      editor.setTextInBufferRange([[1, 0], [1, 7]], '    color 2');
      editor.setTextInBufferRange([[1, 0], [1, 7 + (2 * 2)]], '  color 1');
      editor.setTextInBufferRange([[1, 0], [1, 7 + (2 * 1)]], '      color 3');

      editor.setTextInBufferRange([[2, 0], [2, 7]], '  color 1');
      editor.setTextInBufferRange([[2, 0], [2, 7 + (2 * 1)]], '    color 2');
      editor.insertNewlineBelow();
      editor.setCursorScreenPosition([2, 0]);
      editor.insertText('  ');
      editor.insertText('    ');
      editor.insertText('      ');
      editor.setCursorScreenPosition([2, 4]);
      editor.backspace();
      editor.backspace();
      editor.backspace();

      const numberOfLines = editor.getLineCount();
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(numberOfLines, 'Markers should match number of lines');
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 0,
      }).length).toBe(3, 'Indentation of 0 should be 3');
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 3,
      }).length).toBe(1, 'Indentation of 3 should be 1');
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 2,
      }).length).toBe(0);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 1,
      }).length).toBe(0);
    });

    it('Should set correct paint when removing indentation from a single line', () => {
      const editor = atom.workspace.getActiveTextEditor();

      editor.setText(indentedLine);

      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 4,
      }).length).toBe(1);

      const indentedLine2 = '      indentation of 3';
      editor.setTextInBufferRange([[0, 0], [0, 24]], indentedLine2);
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 3,
      }).length).toBe(1);

      const indentedLine3 = '    indentation of 2';
      editor.setTextInBufferRange([[0, 0], [0, 22]], indentedLine3);
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 2,
      }).length).toBe(1);
    });

    it('Should set correct paint when adding indentation from a single line', () => {
      const editor = atom.workspace.getActiveTextEditor();

      editor.setText(nonIndentedLine);

      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 0,
      }).length).toBe(1);

      const indentedLine1 = '  indentation of 1';
      editor.setTextInBufferRange([[0, 0], [0, 24]], indentedLine1);
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 1,
      }).length).toBe(1);

      const indentedLine2 = '    indentation of 2';
      editor.setTextInBufferRange([[0, 0], [0, 22]], indentedLine2);
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 2,
      }).length).toBe(1);

      const indentedLine3 = '      indentation of 3';
      editor.setTextInBufferRange([[0, 0], [0, 22]], indentedLine3);
      expect(editor.findMarkers({
        colorIndent: true,
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 3,
      }).length).toBe(1);
    });

    it('Should paint to next tabulation until spaces are met', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(' Some text with only one space before');

      // There should be 1 style for zero indentation
      expect(
        editor.findMarkers({
          colorIndent: true,
          indent: 0,
        }).length,
      ).toBe(1);

      editor.setText('  Some text with two spaces (one tabulation)');

      // There should be 0 style for zero indentation
      expect(
        editor.findMarkers({
          colorIndent: true,
          indent: 0,
        }).length,
      ).toBe(0);

      // There should be 1 style for one indentation
      expect(
        editor.findMarkers({
          colorIndent: true,
          indent: 1,
        }).length,
      ).toBe(1);
    });
  });

  describe('Gutter Width', () => {
    it('When enabled, gutter should have no style', () => {
      const editor = atom.workspace.getActiveTextEditor();

      editor.setText(indentedText);

      const gutter = editor.gutterWithName('color-indent');

      expect(gutter.getElement().getAttribute('style')).toBe('');
    });

    it('When disabled, gutter width should match chosen width', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      atom.config.set('color-indent.gutterWidth', true);
      const width = `${atom.config.get('color-indent.width')}px`;

      const gutter = editor.gutterWithName('color-indent');

      expect(gutter.getElement().getAttribute('style')).toBe(`width:${width};min-width:${width}`);
    });
  });

  describe('Configuration', () => {
    it('Should change painting when configuration colors change', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      const chosenColor = '#ef3b17';
      const indentationDepth = atom.config.get('color-indent.indentationDepthLevel');

      // Set to red-ish color
      atom.config.set('color-indent.color.customColor', chosenColor);
      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC(0, chosenColor),
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC((1 * (-100 / indentationDepth)) / 100, chosenColor),
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC((2 * (-100 / indentationDepth)) / 100, chosenColor),
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC((3 * (-100 / indentationDepth)) / 100, chosenColor),
      }).length).toBe(1);
      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC((4 * (-100 / indentationDepth)) / 100, chosenColor),
      }).length).toBe(1);
    });

    it('Should use the default color', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      const chosenColor = '#ef3b17';

      // Set to red-ish color
      atom.config.set('color-indent.color.customColor', chosenColor);
      atom.config.set('color-indent.color.useDefault', true);

      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC(0, chosenColor),
      }).length).toBe(0);

      expect(editor.findMarkers({
        colorIndent: true,
        color: pSBC(0, '#00a6fb'),
      }).length).toBe(1);
    });

    it('Should change painting when configuration width change', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      const numberOfLines = editor.getLineCount();

      atom.config.set('color-indent.width', 1);
      expect(editor.findMarkers({
        colorIndent: true,
        width: '1px',
      }).length).toBe(numberOfLines);
      expect(editor.findMarkers({
        colorIndent: true,
        width: '3px',
      }).length).toBe(0);
    });

    it('Should change painting when tabulation depth  lebel changes', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      const numberOfLines = editor.getLineCount();

      atom.config.set('color-indent.indentationDepthLevel', 2);

      expect(editor.findMarkers({
        colorIndent: true,
        indent: 0,
      }).length).toBe(1);

      // Indentation color can't exceed the depth level we chose.
      expect(editor.findMarkers({
        colorIndent: true,
        indent: 1,
      }).length).toBe(numberOfLines - 1);
    });

    it('Should update gutter width by changing width', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      atom.config.set('color-indent.gutterWidth', true);
      atom.config.set('color-indent.width', 10);

      const gutter = editor.gutterWithName('color-indent');

      expect(gutter.getElement().getAttribute('style')).toBe('width:10px;min-width:10px');
    });

    it('Should remove gutterWidth style', () => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(indentedText);
      atom.config.set('color-indent.gutterWidth', true);
      atom.config.set('color-indent.gutterWidth', false);

      const gutter = editor.gutterWithName('color-indent');

      expect(gutter.getElement().getAttribute('style')).toBe('');
    });
  });
});
