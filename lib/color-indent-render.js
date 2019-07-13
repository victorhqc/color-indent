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

const getIndentationColor = (textEditor, { line, chosenIndentationDepth }) => {
  const indentation = textEditor.indentationForBufferRow(line);

  if (indentation > (chosenIndentationDepth - 1)) {
    return Math.floor(chosenIndentationDepth) - 1;
  }

  return Math.floor(indentation);
};

// Darken color per indentation where -1 is black.
const getColor = ({ indentation, chosenIndentationDepth, chosenColor }) => pSBC(
  (indentation * (-100 / chosenIndentationDepth)) / 100, chosenColor);

const paintTextEditorLine = (textEditor, {
  line,
  gutter,
  chosenColor,
  chosenWidth,
  chosenIndentationDepth,
}) => {
  const indentation = getIndentationColor(textEditor, { line, chosenIndentationDepth });
  const initialPoint = [line, 0];

  const marker = textEditor.markBufferPosition(initialPoint);
  const color = getColor({ indentation, chosenIndentationDepth, chosenColor });

  marker.setProperties({
    colorIndent: true,
    indent: indentation,
    line,
    color,
    width: chosenWidth,
  });

  if (marker.isValid() && !marker.isDestroyed()) {
    const item = el('div.color-indent', {
      'data-line': line,
      style: {
        backgroundColor: color,
        width: chosenWidth,
      },
    });

    gutter.decorateMarker(marker, {
      type: 'gutter',
      line,
      item,
    });
  }
};

const readTextEditorLines = (textEditor, { numberOfLines, ...preferences }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { line, ...preferences });
  }
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

const deleteMarkersFromRange = (textEditor, range) => {
  const markerLayer = textEditor.getDefaultMarkerLayer();
  const existingMarkers = markerLayer.findMarkers({
    colorIndent: true,
    intersectsBufferRowRange: [range.start.row, range.end.row],
  });
  existingMarkers.forEach(marker => marker.destroy());
};

export const textDidChange = ({ changes }, { textEditor, ...preferences }) => {
  const gutter = textEditor.gutterWithName('color-indent');

  map(changes, (change) => {
    if (!isNewMarkerNeeded(change)) {
      return;
    }

    const { newRange } = change;

    deleteMarkersFromRange(textEditor, newRange);

    const fromLine = newRange.start.row;
    const toLine = newRange.end.row;

    // Paints new lines
    for (let line = fromLine; line <= toLine; line += 1) {
      paintTextEditorLine(textEditor, { line, gutter, ...preferences });
    }
  });
};

export const paint = (textEditor, { chosenGutterWidth, ...preferences }) => {
  const gutter = textEditor.addGutter({
    name: 'color-indent',
    priority: 1,
  });

  // By default atom sets the gutters as `min-width: 1em`. Enabling `gutterWidth` config
  // overrides it.
  if (chosenGutterWidth) {
    gutter.getElement().setAttribute(
      'style',
      `width:${preferences.chosenWidth};min-width:${preferences.chosenWidth}`,
    );
  } else {
    gutter.getElement().setAttribute('style', '');
  }

  const numberOfLines = textEditor.getLineCount();
  readTextEditorLines(textEditor, { numberOfLines, gutter, ...preferences });
};
