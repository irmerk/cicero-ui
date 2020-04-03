import isHotkey from 'is-hotkey';
import { Transforms, Node, Editor } from 'slate';
import inVariable from '../utilities/inVariable';

/* eslint no-param-reassign: 0 */
const withVariables = (editor) => {
  const { insertText, isInline } = editor;
  editor.insertText = (text) => {
    const nextNode = Editor.next(editor, { at: editor.selection.focus.path });
    const textLength = Node.get(editor, editor.selection.focus.path).text.length;

    // if the current focus is at the end of a node and the next node is a variable
    // move focus to the start of the variable node
    if (nextNode && nextNode[0].type === 'variable' && textLength === editor.selection.focus.offset) {
      Transforms.select(editor, nextNode[1]);
      Transforms.collapse(editor, { edge: 'start' });
    }

    if (Node.parent(editor, editor.selection.focus.path).type === 'variable') {
      Transforms.insertText(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.isInline = element => (element.type === 'variable' ? true : isInline(element));
  return editor;
};

export const isEditable = (lockText, editor, event) => {
  if (!lockText || !editor.isInsideClause() || isHotkey('mod+c', event) || isHotkey('mod+x', event)) {
    return true;
  }
  const { selection } = editor;
  const textLength = Node.get(editor, editor.selection.focus.path).text.length;
  if (inVariable(editor)) {
    if (isHotkey('backspace', event)) {
      // Do not allow user to delete variable if only 1 char left
      if (textLength === 1) {
        return false;
      }
      // if we hit backspace and are at the zeroth position of a
      // variable prevent deleting the char that precedes the variable
      return selection.anchor.offset > 0;
    }
  }
  const nextNode = Editor.next(editor, { at: editor.selection.focus.path });
  // if the current focus is at the end of a node & the next node is a variable allow editing
  if (nextNode && nextNode[0].type === 'variable' && textLength === editor.selection.focus.offset) {
    return true;
  }
  return inVariable(editor);
};

export default withVariables;
