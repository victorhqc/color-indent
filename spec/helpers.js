'use babel';

import filter from 'lodash/filter';

export const saveEditor = editor => new Promise(resolve =>
  editor.save().then(resolve(editor)),
);

export const openTestFile = atom => atom.workspace.open(`${__dirname}/text-helper.txt`);

export const activatePackage = atom => atom.packages.activatePackage('color-indent');

export const findDecorations = (editor) => {
  const decorations = editor.getDecorations({
    type: 'line-number',
  });

  return filter(
    decorations,
    decoration => decoration.properties.class.match(new RegExp('color-indent')) !== null,
  );
};

export const findDecorationsByColor = (editor, color) =>
  filter(findDecorations(editor), decoration =>
    decoration.properties.class.match(new RegExp(color, 'g')) !== null,
  );

export const findDecorationsByWidth = (editor, width) =>
  filter(findDecorations(editor), decoration =>
    decoration.properties.class.match(new RegExp(`color-indent-width-${width}`, 'g')) !== null,
  );

export const getCurrentColor = atom => atom.config.get('color-indent.color');

export const findDecorationByIndentation = (decorations, indentation) =>
  filter(
    decorations,
    decoration => decoration.properties.class.match(new RegExp(`color-indent-${indentation}`, 'g')) !== null,
  );

export const togglePackage = (atom) => {
  const workspaceElement = atom.views.getView(atom.workspace);
  atom.commands.dispatch(workspaceElement, 'color-indent:toggle');
};
