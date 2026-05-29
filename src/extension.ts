import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

function getWorkspaceFolder(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function getOrCreateTerminal(name: string): vscode.Terminal {
  const existing = vscode.window.terminals.find(t => t.name === name);
  return existing ?? vscode.window.createTerminal({ name, cwd: getWorkspaceFolder() });
}

function checkCli(): Promise<boolean> {
  return new Promise(resolve => {
    exec('shingeki_nk --version', err => resolve(!err));
  });
}

export async function activate(context: vscode.ExtensionContext) {
  const cliInstalled = await checkCli();
  if (!cliInstalled) {
    vscode.window.showErrorMessage(
      'Shingeki_nK CLI no encontrado. Instálalo con: dotnet tool install -g shingeki_nk',
      'Ver instrucciones'
    ).then(action => {
      if (action === 'Ver instrucciones') {
        vscode.env.openExternal(vscode.Uri.parse('https://www.nuget.org/packages/shingeki_nk'));
      }
    });
  }

  // Comando: shingeki_nk init (interactivo)
  context.subscriptions.push(
    vscode.commands.registerCommand('shingeki-nk.init', () => {
      const terminal = getOrCreateTerminal('Shingeki_nK');
      terminal.show();
      terminal.sendText('shingeki_nk init');
    })
  );

  // Comando: Shingeki_nK build <archivo.scf>
  context.subscriptions.push(
    vscode.commands.registerCommand('shingeki-nk.build', async () => {
      // Buscar archivos .scf en el workspace
      const scfFiles = await vscode.workspace.findFiles('**/*.scf', '**/node_modules/**');

      let scfPath: string | undefined;

      if (scfFiles.length === 0) {
        // No hay .scf, pedir ruta manualmente
        const input = await vscode.window.showInputBox({
          prompt: 'Ruta del archivo .scf a compilar',
          placeHolder: 'mi-proyecto.scf'
        });
        if (!input) return;
        scfPath = input;
      } else if (scfFiles.length === 1) {
        scfPath = scfFiles[0].fsPath;
      } else {
        // Varios .scf, mostrar picker
        const items = scfFiles.map(f => ({
          label: path.basename(f.fsPath),
          description: f.fsPath,
          fsPath: f.fsPath
        }));
        const picked = await vscode.window.showQuickPick(items, {
          placeHolder: 'Selecciona el archivo .scf a compilar'
        });
        if (!picked) return;
        scfPath = picked.fsPath;
      }

      const terminal = getOrCreateTerminal('Shingeki_nK');
      terminal.show();
      terminal.sendText(`Shingeki_nK build "${scfPath}"`);
    })
  );
}

export function deactivate() {}
