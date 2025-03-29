const vscode = require("vscode");
const path = require("path");
const fs = require("fs");


class MyWebviewProvider {
    constructor(context) {
        this.context = context;
    }

    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true, // Enable JavaScript in WebView
        };

        const htmlPath = path.join(this.context.extensionPath, 'media', 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        webviewView.webview.html = htmlContent;


        // Handle messages from WebView
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'sendMessage') {
                console.log("User message:", message.text);
                webviewView.webview.postMessage({ command: 'addMessage', text: `AI: Received '${message.text}'` });
            }
        });
    }

}


module.exports = { MyWebviewProvider };