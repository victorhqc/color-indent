'use babel';

import map from 'lodash/map';
import { el } from 'redom';
import pSBC from 'shade-blend-color';

export const clean = (textEditor) => {
  const markers = textEditor.findMarkers({
    colorIndent: true,
  });
  map(markers, marker => marker.destroy());

  const gutter = textEditor.gutterWithName('color-indent');
  if (gutter) {
    gutter.destroy();
  }
};

const getIndentationColor = (textEditor, { line, numberOfColors }) => {
  const indentation = textEditor.indentationForBufferRow(line);

  if (indentation > (numberOfColors - 1)) {
    return numberOfColors - 1;
  }

  return Math.floor(indentation);
};

const paintTextEditorLine = (textEditor, {
  line,
  gutter,
  chosenColor,
  chosenWidth,
  numberOfColors,
}) => {
  const indentationColor = getIndentationColor(textEditor, { line, numberOfColors });
  const initialPoint = [line, 0];

  const marker = textEditor.markBufferPosition(initialPoint);

  marker.setProperties({
    colorIndent: true,
    indent: indentationColor,
    line,
  });

  if (marker.isValid() && !marker.isDestroyed()) {
    const item = el('div', {
      style: {
        // Darken color per indentation where -1 is black.
        backgroundColor: pSBC((indentationColor * (-100 / numberOfColors)) / 100, '#00a6fb'),
        width: chosenWidth,
      },
    });

    gutter.decorateMarker(marker, {
      type: 'gutter',
      item,
    });
  }
};

const readTextEditorLines = (textEditor, { numberOfLines, ...preferences }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { line, ...preferences });
  }
};

const paintMultipleLines = (textEditor, { fromLine, toLine, ...preferences }) => {
  for (let line = fromLine; line <= toLine; line += 1) {
    paintTextEditorLine(textEditor, { line, ...preferences });
  }
};

const removeMarkersFromRange = (textEditor, range) => {
  const existingMarkers = textEditor.findMarkers({
    colorIndent: true,
    startBufferRow: range.start.row,
    endBufferRow: range.end.row,
  });

  existingMarkers.forEach(marker => marker.destroy());
};

const isNewMarkerNeeded = (change) => {
  const {
    oldRange,
    newRange,
    newText,
    oldText,
  } = change;

  // If adds a space when line was empty.
  if (oldRange.start.column === 0 && newRange.end.column > 0) {
    return true;
  }

  // When change has different lines.
  if (newRange.start.row !== newRange.end.row || oldRange.start.row !== oldRange.end.row) {
    return true;
  }

  // When removes tabulation.
  if (!newText && oldText.match(/\s|\t/) && oldRange.end.column > oldRange.start.column) {
    return true;
  }

  // Adds tabulation.
  if (!oldText && newText.match(/\s|\t/) && newRange.end.column > oldRange.start.column) {
    return true;
  }

  return false;
};

export const textDidChange = ({ changes }, { textEditor, ...preferences }) => {
  const gutter = textEditor.gutterWithName('color-indent');

  map(changes, (change) => {
    if (!isNewMarkerNeeded(change)) {
      return;
    }

    const fromLine = change.newRange.start.row;
    const toLine = change.newRange.end.row;

    // Clean markers before making new ones.
    removeMarkersFromRange(textEditor, change.newRange);

    if (fromLine === toLine) {
      // Paints new line
      paintTextEditorLine(textEditor, {
        line: change.newRange.start.row,
        gutter,
        ...preferences,
      });
    } else {
      // Paints new lines
      paintMultipleLines(textEditor, {
        fromLine: change.newRange.start.row,
        toLine: change.newRange.end.row,
        gutter,
        ...preferences,
      });
    }
  });
};

export const paint = (textEditor, { showGutter, ...preferences }) => {
  const gutter = textEditor.addGutter({
    name: 'color-indent',
    priority: 1,
  });

  const numberOfLines = textEditor.getLineCount();
  readTextEditorLines(textEditor, { numberOfLines, gutter, ...preferences });
};
