const vscode = require("vscode");
const { MyWebviewProvider } = require('./webviewProvider'); // Import the class


function activate(context) {
    console.log("tGenieAI extension activated");

    const provider = new MyWebviewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("mySidebarView",provider));

    let disposable = vscode.commands.registerCommand('tgenieai.requestAction', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }

        // Get selected text
        const selectedText = editor.document.getText(editor.selection);

        // Prompt the user for action input
        const action = await vscode.window.showInputBox({
            placeHolder: 'Enter an action (e.g., "Help me revise this")'
        });

        if (!action) {
            vscode.window.showInformationMessage('Action was not entered');
            return;
        }

        // Call the external AI API with the action and selected code
        try {
            console.log(action);
            console.log(selectedText);
            const aiResponse = "OK"; // adjust depending on your API's response structure
            vscode.window.showInformationMessage(`AI Response: ${aiResponse}`);
        } catch (error) {
            vscode.window.showErrorMessage('Error while calling the API');
        }
    });

    context.subscriptions.push(disposable);


    console.log("✅ SidebarProvider registered!");
}


function deactivate() { }

module.exports = { activate, deactivate };