const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('headerswitch.switch', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(
                'Откройте C++ файл (.cpp, .h или .hpp), чтобы использовать HeaderSwitch.'
            );
            return;
        }

        const file = editor.document.fileName;
        const ext = path.extname(file).toLowerCase();
        const base = path.basename(file, ext);
        const dir = path.dirname(file);

        const headerExts = ['.h', '.hpp'];
        const sourceExts = ['.cpp'];

        let targets;
        if (sourceExts.includes(ext)) {
            targets = headerExts;
        } else if (headerExts.includes(ext)) {
            targets = sourceExts;
        } else {
            vscode.window.showInformationMessage(
                'Этот файл не является C++ исходником или заголовком (.cpp/.h/.hpp).'
            );
            return;
        }

        const wsRoot = vscode.workspace.rootPath || '';
        const searchFolders = [
            dir,
            path.join(wsRoot, 'include'),
            path.join(wsRoot, 'src')
        ];

        let found = null;

        for (const folder of searchFolders) {
            for (let i = 0; i < targets.length; i++) {
                const candidate = path.join(folder, base + targets[i]);
                if (fs.existsSync(candidate)) {
                    found = candidate;
                    break;
                }
            }
            if (found) break;
        }

        if (found) {
            const doc = await vscode.workspace.openTextDocument(found);
            await vscode.window.showTextDocument(doc);
        } else {
            vscode.window.showInformationMessage(
                'Парный файл не найден в текущей папке и в папках include/src.'
            );
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };