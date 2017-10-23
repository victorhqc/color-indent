'use babel';

import {
  openTestFile,
  activatePackage,
  findDecorations,
  findDecorationByIndentation,
  findDecorationsByColor,
  findDecorationsByWidth,
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

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('ColorIndent', () => {
  beforeEach(() => {
    waitsForPromise(() => openTestFile(atom));

    waitsForPromise(() => activatePackage(atom));
  });

  it('Should activate package', () => {
    expect(atom.packages.isPackageActive('color-indent')).toBeTruthy();
  });

  it('Should update paint in multiple lines', () => {
    const editor = atom.workspace.getActiveTextEditor();

    editor.setText(indentedText);
    editor.setText(indentedText);
    editor.setText(indentedText);

    const numberOfLines = editor.getLineCount();
    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(numberOfLines);

    // There should be 1 style for zero indentation
    const zeroTabDecorations = findDecorationByIndentation(decorations, 0);
    expect(
      zeroTabDecorations.length,
    ).toBe(1);

    // There should be 1 style for one indentation
    const oneTabDecorations = findDecorationByIndentation(decorations, 1);
    expect(
      oneTabDecorations.length,
    ).toBe(1);

    // There should be 1 style for two indentation
    const twoTabDecorations = findDecorationByIndentation(decorations, 2);
    expect(
      twoTabDecorations.length,
    ).toBe(1);

    // There should be 1 style for two indentation
    const threeTabDecorations = findDecorationByIndentation(decorations, 3);
    expect(
      threeTabDecorations.length,
    ).toBe(1);

    // There should be 1 style for two indentation
    const fourTabDecorations = findDecorationByIndentation(decorations, 4);
    expect(
      fourTabDecorations.length,
    ).toBe(2);
  });

  it('Should update when editing current line', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);

    // // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[1, 0], [1, 21]], textToInsert);
    const firstDecorations = findDecorations(editor);

    expect(firstDecorations.length).toBe(4);

    // Adds another tabulation in another line
    const textToInsert2 = '  tabulation of 4';
    editor.setTextInBufferRange([[2, 0], [2, 21]], textToInsert2);
    const secondDecorations = findDecorations(editor);

    expect(secondDecorations.length).toBe(4);

    // There should be 2 style for zero indentation
    const zeroTabDecorations = findDecorationByIndentation(secondDecorations, 0);
    expect(
      zeroTabDecorations.length,
    ).toBe(2);

    // There should be 1 style for one indentation
    const oneTabDecorations = findDecorationByIndentation(secondDecorations, 1);
    expect(
      oneTabDecorations.length,
    ).toBe(1);

    // There should be 1 style for two indentation
    const twoTabDecorations = findDecorationByIndentation(secondDecorations, 2);
    expect(
      twoTabDecorations.length,
    ).toBe(1);
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
    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(numberOfLines + 1);
  });

  it('Should remove all paint toggling the package', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const numberOfLines = editor.getLineCount();
    expect(findDecorations(editor).length).toBe(numberOfLines);

    // Toggles off
    togglePackage(atom);

    expect(findDecorations(editor).length).toBe(0);
  });

  it('Should repaint after toggling package', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const numberOfLines = editor.getLineCount();
    expect(findDecorations(editor).length).toBe(numberOfLines);

    // Toggles off
    togglePackage(atom);
    // Toggles on
    togglePackage(atom);

    expect(findDecorations(editor).length).toBe(numberOfLines);
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

    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(0);
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
    const decorations = findDecorations(editor);

    expect(decorations.length).toBe(numberOfLines + 1);
  });

  it('Should set correct paint when removing indentation from a single line', () => {
    const editor = atom.workspace.getActiveTextEditor();

    editor.setText(indentedLine);
    expect(findDecorations(editor).length).toBe(1);
    const fourTabDecorations = findDecorationByIndentation(findDecorations(editor), 4);
    expect(
      fourTabDecorations.length,
    ).toBe(1);

    const indentedLine2 = '      indentation of 3';
    editor.setTextInBufferRange([[0, 0], [0, 24]], indentedLine2);
    expect(findDecorations(editor).length).toBe(1);
    const threeTabDecorations = findDecorationByIndentation(findDecorations(editor), 3);
    expect(
      threeTabDecorations.length,
    ).toBe(1);

    const indentedLine3 = '    indentation of 2';
    editor.setTextInBufferRange([[0, 0], [0, 22]], indentedLine3);
    expect(findDecorations(editor).length).toBe(1);
    const twoTabDecorations = findDecorationByIndentation(findDecorations(editor), 2);
    expect(
      twoTabDecorations.length,
    ).toBe(1);
  });

  it('Should change painting when configuration colors change', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const numberOfLines = editor.getLineCount();

    atom.config.set('color-indent.color', 'green');
    const greenDecorations = findDecorationsByColor(editor, 'green');
    expect(greenDecorations.length).toBe(numberOfLines);

    const blueDecorations = findDecorationsByColor(editor, 'blue');
    expect(blueDecorations.length).toBe(0);
  });

  it('Should change painting when configuration width change', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const numberOfLines = editor.getLineCount();

    atom.config.set('color-indent.width', '3');
    const greenDecorations = findDecorationsByWidth(editor, '3');
    expect(greenDecorations.length).toBe(numberOfLines);

    const blueDecorations = findDecorationsByWidth(editor, '5');
    expect(blueDecorations.length).toBe(0);
  });

  it('Should paint to next tabulation until spaces are met', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(' Some text with only one space before');

    const decorations = findDecorations(editor);

    // There should be 1 style for zero indentation
    const zeroTabDecorations = findDecorationByIndentation(decorations, 0);
    expect(
      zeroTabDecorations.length,
    ).toBe(1);

    editor.setText('  Some text with two spaces (one tabulation)');

    const decorationsThen = findDecorations(editor);

    // There should be 0 style for zero indentation
    const zeroTabDecorationsThen = findDecorationByIndentation(decorationsThen, 0);
    expect(
      zeroTabDecorationsThen.length,
    ).toBe(0);

    // There should be 1 style for one indentation
    const oneTabDecorationsThen = findDecorationByIndentation(decorationsThen, 1);
    expect(
      oneTabDecorationsThen.length,
    ).toBe(1);
  });
});
