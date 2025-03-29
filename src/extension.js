const vscode = require("vscode");
const { MyWebviewProvider } = require('./webviewProvider'); // Import the class
const https = require("https");

const sendQueryToOpenAI = async (queryText, openAIKey, editor) => {
    if (!editor) {
        vscode.window.showInformationMessage('No active editor found');
        return;
    }

    let config = vscode.workspace.getConfiguration();
    const model = config.get("chatgpt-helper.model") || "gpt-3.5-turbo";

    const entireQueryText = queryText.replace(/\r\n/g, "\n");

    const requestData = JSON.stringify({
        model: model === "gpt-4" ? "gpt-4" : "gpt-3.5-turbo",
        max_tokens: 512,
        messages: [
            {
                role: "system",
                content: "You are a knowledgeable and helpful assistant called ChatGPT, who specializes in helping users with their code.",
            },
            {
                role: "user",
                content: entireQueryText,
            },
        ],
    });

    const options = {
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAIKey}`,
        },
    };

    return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
            let data = "";

            response.on("data", (chunk) => {
                data += chunk;
            });

            response.on("end", () => {
                try {
                    const jsonResponse = JSON.parse(data);
                    const responseText = jsonResponse.choices[0]?.message?.content || "No response from AI.";

                    // Update the selected text in the editor
                    editor.edit((editBuilder) => {
                        editBuilder.replace(editor.selection, responseText);
                    });

                    resolve(responseText);
                } catch (error) {
                    console.error("Error parsing AI response:", error);
                    vscode.window.showErrorMessage("Error parsing AI response.");
                    reject(error);
                }
            });
        });

        request.on("error", (error) => {
            console.error("Error querying ChatGPT:", error);
            vscode.window.showErrorMessage("Error querying ChatGPT.");
            reject(error);
        });

        request.write(requestData);
        request.end();
    });
};


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
            editor.edit((editBuilder) => {
                editBuilder.replace(editor.selection, "This is the test");
            });
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