'use babel';

import map from 'lodash/map';

const removeMarkers = (textEditor, markerManager, markers) => map(markers, (marker) => {
  if (!marker) {
    return;
  }

  markerManager.remove(textEditor.id, marker.id);

  const textEditorMarker = textEditor.getMarker(marker.id);
  if (textEditorMarker) {
    textEditorMarker.destroy();
  }
});

const cleanFromRange = (textEditor, range, markerManager) => {
  const markers = markerManager.findByRange(textEditor.id, range.start.row, range.end.row);
  console.log('markers', markers);
  removeMarkers(textEditor, markerManager, markers);
};

export const clean = (textEditor, { markerManager }) => {
  const markers = markerManager.getMarkers(textEditor.id);
  removeMarkers(textEditor, markerManager, markers);
};

const getColorClass = (textEditor, { line }) => {
  const NUMBER_OF_COLORS = 4;

  const indentation = textEditor.indentationForBufferRow(line);

  if (indentation > NUMBER_OF_COLORS) {
    return NUMBER_OF_COLORS;
  }

  return indentation;
};

const paintTextEditorLine = (textEditor, { line, chosenColor, markerManager }) => {
  const colorClass = getColorClass(textEditor, { line });
  const initialPoint = [line, 0];

  const marker = textEditor.markBufferPosition(initialPoint);
  markerManager.add(textEditor.id, marker.id, line);

  textEditor.decorateMarker(marker, {
    type: 'line-number',
    class: `color-indent color-indent-${colorClass} ${chosenColor} line-${line}`,
  });
};


const readTextEditorLines = (textEditor, { markerManager, numberOfLines, chosenColor }) => {
  for (let line = 0; line < numberOfLines; line += 1) {
    paintTextEditorLine(textEditor, { markerManager, line, chosenColor });
  }
};

const paintMultipleLines = (textEditor, {
  fromLine,
  toLine,
  chosenColor,
  markerManager,
}) => {
  for (let line = fromLine; line <= toLine; line += 1) {
    paintTextEditorLine(textEditor, { line, chosenColor, markerManager });
  }
};

export const textDidChange = ({ changes }, { textEditor, chosenColor, markerManager }) =>
  map(changes, (change) => {
    console.log('change', change);
    
    // Cleans previous markers before adding new ones.
    cleanFromRange(textEditor, change.newRange, markerManager);

    const fromLine = change.newRange.start.row;
    const toLine = change.newRange.end.row;

    if (fromLine === toLine) {
      return paintTextEditorLine(textEditor, {
        line: fromLine,
        chosenColor,
        markerManager,
      });
    }

    // Updates changes in different lines.
    return paintMultipleLines(textEditor, {
      fromLine,
      toLine,
      chosenColor,
      markerManager,
    });
  });

export const paint = (textEditor, props) => {
  const numberOfLines = textEditor.getLineCount();
  readTextEditorLines(textEditor, { numberOfLines, ...props });
};
