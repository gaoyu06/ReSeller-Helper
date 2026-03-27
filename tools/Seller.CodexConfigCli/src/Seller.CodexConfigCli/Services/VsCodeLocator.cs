using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public class VsCodeLocator
{
    public virtual PathSet Resolve(IEnumerable<string> workspacePaths, string? userDirectoryOverride = null)
    {
        string userDirectory;

        if (!string.IsNullOrWhiteSpace(userDirectoryOverride))
        {
            userDirectory = Path.GetFullPath(userDirectoryOverride);
        }
        else
        {
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            if (string.IsNullOrWhiteSpace(appData))
            {
                throw new ConfigException("无法解析 APPDATA 目录。");
            }

            userDirectory = Path.Combine(appData, "Code", "User");
        }

        var workspaces = workspacePaths
            .Select(Path.GetFullPath)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(BuildWorkspace)
            .ToArray();

        return new PathSet(
            userDirectory,
            Path.Combine(userDirectory, "settings.json"),
            Path.Combine(userDirectory, "keybindings.json"),
            workspaces);
    }

    private static WorkspacePathSet BuildWorkspace(string rootPath)
    {
        var normalizedRoot = Path.GetFullPath(rootPath);
        var vscodeDirectory = Path.Combine(normalizedRoot, ".vscode");

        return new WorkspacePathSet(
            normalizedRoot,
            vscodeDirectory,
            Path.Combine(vscodeDirectory, "settings.json"),
            Path.Combine(vscodeDirectory, "extensions.json"));
    }
}
