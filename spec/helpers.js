'use babel';

export const saveEditor = editor => new Promise(resolve => editor.save().then(resolve(editor)));

export const openTestFile = atom => atom.workspace.open(`${__dirname}/text-helper.txt`);

export const activatePackage = atom => atom.packages.activatePackage('color-indent');

export const togglePackage = (atom) => {
  const workspaceElement = atom.views.getView(atom.workspace);
  atom.commands.dispatch(workspaceElement, 'color-indent:toggle');
};
