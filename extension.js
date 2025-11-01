const vscode = require('vscode');

function activate(context) {
    vscode.commands.registerCommand('headerswitch.helloWorld', () => {
        vscode.window.showInformationMessage('HeaderSwitch is working!');
    });
}

function deactivate() {}

module.exports = { activate, deactivate };