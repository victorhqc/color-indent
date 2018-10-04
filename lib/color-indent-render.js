'use babel';

import map from 'lodash/map';
import { el } from 'redom';
import pSBC from 'shade-blend-color';

// const removeMarkersFromRange = (textEditor, range) => {
//   const fromLine = range.start.row;
//   const toLine = range.end.row;
//
//   for (let line = fromLine; line <= toLine; line += 1) {
//     const markers = textEditor.findMarkers({
//       colorIndent: true,
//       line,
//     });
//     map(markers, (marker) => {
//       if (marker.isValid()) {
//         return;
//       }
//       marker.destroy();
//     });
//   }
// };

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

const getIndentationColor = (textEditor, { line }) => {
  const NUMBER_OF_COLORS = 10;

  const indentation = textEditor.indentationForBufferRow(line);

  if (indentation > NUMBER_OF_COLORS) {
    return NUMBER_OF_COLORS;
  }

  return Math.floor(indentation);
};

const paintTextEditorLine = (textEditor, {
  line,
  gutter,
  chosenColor,
  chosenWidth,
}) => {
  const indentationColor = getIndentationColor(textEditor, { line });
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
        backgroundColor: pSBC((indentationColor * -10) / 100, '#00a6fb'),
        width: chosenWidth,
      },
    });

    gutter.decorateMarker(marker, {
      type: 'gutter',
      item,
    });
  }
  //
  // if (marker.isValid() && !marker.isDestroyed()) {
  //   textEditor.decorateMarker(marker, {
  //     type: 'line-number',
  //     class: `color-indent color-indent-width-${chosenWidth} color-indent-${colorClass} ${chosenColor}`,
  //   });
  // }
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
  // If adds a space when line was empty.
  if (change.oldRange.start.column === 0 && change.newRange.end.column > 0) {
    return true;
  }

  // When change has different lines.
  if (change.newRange.start.row !== change.newRange.end.row) {
    return true;
  }
  return false;
};

export const textDidChange = ({ changes }, { textEditor, ...preferences }) => {
  const gutter = textEditor.gutterWithName('color-indent');

  map(changes, (change) => {
    console.log('CHANGE', change);
    if (!isNewMarkerNeeded(change)) {
      return;
    }
    console.log('MARKER NEEDED');

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
