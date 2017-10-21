'use babel';

import map from 'lodash/map';

const removeMarkersFromRange = (textEditor, range) => {
  const fromLine = range.start.row;
  const toLine = range.end.row;

  for (
    let line = fromLine;
    line <= toLine;
    line += 1
  ) {
    const markers = textEditor.findMarkers({
      colorIndent: true,
      line,
    });
    map(markers, (marker) => {
      if (marker.isValid()) {
        return;
      }
      marker.destroy();
    });
  }
};

export const clean = (textEditor) => {
  const markers = textEditor.findMarkers({
    colorIndent: true,
  });
  map(markers, marker => marker.destroy());
};

const getColorClass = (textEditor, { line }) => {
  const NUMBER_OF_COLORS = 4;

  const indentation = textEditor.indentationForBufferRow(line);

  if (indentation > NUMBER_OF_COLORS) {
    return NUMBER_OF_COLORS;
  }

  return indentation;
};

const paintTextEditorLine = (textEditor, { line, chosenColor, chosenWidth }) => {
  const colorClass = getColorClass(textEditor, { line });
  const initialPoint = [line, 0];

  const marker = textEditor.markBufferPosition(initialPoint, {
    invalidate: 'touch',
  });
  marker.setProperties({
    colorIndent: true,
    indent: colorClass,
    line,
  });

  textEditor.decorateMarker(marker, {
    type: 'line-number',
    class: `color-indent color-indent-width-${chosenWidth} color-indent-${colorClass} ${chosenColor}`,
  });
};

const readTextEditorLines = (textEditor, { numberOfLines, ...preferences }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { line, ...preferences });
  }
};

const paintMultipleLines = (textEditor, {
  fromLine,
  toLine,
  ...preferences
}) => {
  for (let line = fromLine; line <= toLine; line += 1) {
    paintTextEditorLine(textEditor, { line, ...preferences });
  }
};

export const textDidChange = ({ changes }, { textEditor, ...preferences }) =>
  map(changes, (change) => {
    const fromLine = change.newRange.start.row;
    const toLine = change.newRange.end.row;

    removeMarkersFromRange(textEditor, change.newRange);

    if (fromLine === toLine) {
      // Paints new line
      paintTextEditorLine(textEditor, {
        line: change.newRange.start.row,
        ...preferences,
      });
    } else {
      // Paints new lines
      paintMultipleLines(textEditor, {
        fromLine: change.newRange.start.row,
        toLine: change.newRange.end.row,
        ...preferences,
      });
    }
  });

export const paint = (textEditor, preferences) => {
  const numberOfLines = textEditor.getLineCount();
  readTextEditorLines(textEditor, { numberOfLines, ...preferences });
};
