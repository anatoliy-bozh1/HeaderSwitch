const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('headerswitch.switch', async function() {
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
        for (let f = 0; f < searchFolders.length; f++) {
            let folder = searchFolders[f];
            for (let i = 0; i < targets.length; i++) {
                let candidate = path.join(folder, base + targets[i]);
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
            const pickExt = await vscode.window.showQuickPick(targets, {
                placeHolder: 'Парный файл не найден. Выберите расширение нового файла'
            });
            if (!pickExt) return;

            let newFilePath = path.join(dir, base + pickExt);

            let content = '';
            if (pickExt === '.cpp') {
                content = '#include "' + base + '.h"\n\nint main() {\n\n return 0;\n}\n';
            } else {
                content = '#pragma once\n\n// ' + base + pickExt + '\n';
            }

            await fs.promises.writeFile(newFilePath, content, 'utf8');

            const doc = await vscode.workspace.openTextDocument(newFilePath);
            await vscode.window.showTextDocument(doc);

            vscode.window.showInformationMessage('Создан файл ' + base + pickExt);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };