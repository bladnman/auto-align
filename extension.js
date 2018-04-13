// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.autoalign', function () {
      const aligner                   = new Aligner();
      aligner.movableItemsList        = vscode.workspace.getConfiguration().get('autoalign.moveableItems');
      aligner.nonMovableItemsList     = vscode.workspace.getConfiguration().get('autoalign.nonMoveableItems');
      aligner.minSeparation           = vscode.workspace.getConfiguration().get('autoalign.minSeparation');
      aligner.columnWidth             = vscode.workspace.getConfiguration().get('autoalign.columnWidth');

      let editor                      = vscode.window.activeTextEditor;
      let selections                  = editor.selections; // handle multiple selections the same

      if ( ! isSomethingSelected(editor) ) {
        vscode.window.showInformationMessage("Auto-Align only works on selections.");
        return;
      }

      editor.edit((editBuilder) => {
        selections.forEach((selection) => {
          let aligned = aligner.align(getTextFromSelection(editor, selection));
          replaceEditBuilderSelectionWith(editBuilder, selection, aligned);
        });
      });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
function getTextFromSelection(editor, selection) {
  if ( ! editor || ! editor.document || ! selection) {
    return null;
  }
  return editor.document.getText(rangeFromSelection(selection));
}
function replaceEditBuilderSelectionWith(editBuilder, selection, newText) {
  if ( ! editBuilder || ! selection) {
    return;
  }
  editBuilder.replace(rangeFromSelection(selection), newText);
}
function rangeFromSelection(selection) {
  return new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
}
function isSomethingSelected(editor) {
  if ( ! editor) {
    return false;
  }
  let selections        = editor.selections; // handle multiple selections the same
  let foundSomething    = false;
  selections.forEach(selection => {
    if (selection.start.line !== selection.end.line) {
      foundSomething    = true;
    }
  });

  return foundSomething;
}
/** 
 * - - - - - - - - - - - - - -
 * ALIGNER
 * - - - - - - - - - - - - - -
 * Main action class
 */
class Aligner {
  constructor() {
    this.movableItemsList       = [];
    this.nonMovableItemsList    = [];
    this.minSeparation          = 3;
    this.columnWidth            = undefined;
  }
  align(text) {
    if (!text) {
      return text;
    }

    const lines                     = text.split(/\r\n|\r|\n/);

    // NOT ENOUGH TO COMPARE
    if (lines.length < 2) {
      return text;
    }

    // GET FARTHEST ALIGNABLE ELEMENT
    let farthestAlignable           = 0;
    lines.forEach(line => {
      let lineAlignablePosition     = this._getAlignablePosition(line);
      if (lineAlignablePosition >= farthestAlignable) {

        // this is the farthest we've been!
        farthestAlignable           = lineAlignablePosition;
        
        // now, figure out how much white-space is "to the left" of the character
        let leftOfCharacter         = line.substr(0, lineAlignablePosition-1);
        let unTrimmedLength         = leftOfCharacter.length;
        let trimmendLength          = this._trimEnd(leftOfCharacter).length;
        let whiteAtEndCount         = (unTrimmedLength - trimmendLength);

        // we need to make sure it is the "minimum" white-space
        if (whiteAtEndCount < this.minSeparation) {
          let addAtEndCount         = this.minSeparation - whiteAtEndCount;
          farthestAlignable         += addAtEndCount;          
        }

        // NEAREST FACTOR OF
        if (this.columnWidth > 1 && farthestAlignable % this.columnWidth) {
          farthestAlignable         = ((~~(farthestAlignable/this.columnWidth) + 1) * this.columnWidth);
        }
      }
    });

    // WE HAVE THINGS TO ALIGN
    if (farthestAlignable > 0) {
      for (let i = 0; i < lines.length; i++) {
        lines[i]                    = this._alignToPosition(lines[i], farthestAlignable);
      }
    }
    
    return lines.join('\n');
  }

  //** INTERNALS */
  _alignToPosition(line, position) {
    let nearestMovablePosition = this._getAlignablePosition(line);
    
    // BAIL : nothing is movable
    if (nearestMovablePosition < 0 || nearestMovablePosition >= position) {
      return line;
    }

    let insertString = ' '.repeat(position - nearestMovablePosition);
    return this._splice(line, nearestMovablePosition, 0, insertString);
  }
  _getAlignablePosition(line) {
    let nearestMovablePosition = this._getNearestMovablePosition(line);

    // BAIL : nothing is movable
    if (nearestMovablePosition < 0) {
      return -1;
    }

    let nearestNonMovablePosition = this._getNearestNonMovablePosition(line);

    // WE HAVE NON-MOVABLES FIRST : nothing is movable
    if (nearestNonMovablePosition > -1 && nearestMovablePosition >= nearestNonMovablePosition) {
      return -1;
    }

    return nearestMovablePosition;
  }
  _getNearestMovablePosition(line) {
    return this._getNearestOccurance(line, this.movableItemsList);
  }
  _getNearestNonMovablePosition(line) {
    return this._getNearestOccurance(line, this.nonMovableItemsList);
  }
  _getNearestOccurance(line, itemList) {
    let nearestPosition                   = 1000000; // simply huge to start
    let foundItem                         = undefined;
    itemList.forEach(item => {
      let positionOfItem                  = line.indexOf(item);
      if (positionOfItem > -1) {
        foundItem                         = item;
        nearestPosition                   = Math.min(nearestPosition, line.indexOf(item));
      }
    });
    return foundItem ? nearestPosition    : -1;
  }
  _splice(text, start, delCount, insertText) {
    return text.slice(0, start) + insertText + text.slice(start + Math.abs(delCount));
  }
  _trimEnd(text) {
    if ( !text || text.length < 1) {
      return text;
    }
    return text.replace(/[\s\uFEFF\xA0]+$/g, '');
  }
}