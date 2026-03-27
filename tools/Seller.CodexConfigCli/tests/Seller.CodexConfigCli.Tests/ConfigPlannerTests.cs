using System.Text.Json.Nodes;
using Seller.CodexConfigCli.Core;
using Seller.CodexConfigCli.Services;

namespace Seller.CodexConfigCli.Tests;

public sealed class ConfigPlannerTests : IDisposable
{
    private readonly string _rootPath;

    public ConfigPlannerTests()
    {
        _rootPath = Path.Combine(Path.GetTempPath(), "Seller.CodexConfigCli.Tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_rootPath);
    }

    [Fact]
    public void CreatePlan_ShouldMergeUserAndWorkspaceFiles()
    {
        var userDirectory = Path.Combine(_rootPath, "AppData", "Roaming", "Code", "User");
        Directory.CreateDirectory(userDirectory);
        File.WriteAllText(Path.Combine(userDirectory, "settings.json"), "{ \"existing\": true }");
        File.WriteAllText(Path.Combine(userDirectory, "keybindings.json"), "[]");

        var workspace = Path.Combine(_rootPath, "workspace-a");
        Directory.CreateDirectory(Path.Combine(workspace, ".vscode"));
        File.WriteAllText(Path.Combine(workspace, ".vscode", "settings.json"), "{ \"files.autoSave\": \"off\" }");
        File.WriteAllText(Path.Combine(workspace, ".vscode", "extensions.json"), "{ \"recommendations\": [\"existing.extension\"] }");

        var planner = CreatePlanner(userDirectory);
        var profile = new ProfileDocument(
            new JsonObject { ["new.setting"] = true },
            new JsonArray
            {
                new JsonObject
                {
                    ["key"] = "ctrl+alt+c",
                    ["command"] = "codex.open",
                },
            },
            new JsonObject { ["files.autoSave"] = "afterDelay" },
            new JsonArray("publisher.codex"),
            new JsonArray());

        var plan = planner.CreatePlan(profile, [workspace]);

        Assert.True(plan.Success);
        Assert.Equal(4, plan.Files.Count);
        Assert.Contains(plan.Files, file => file.Kind == FileKind.UserSettings && file.Status == PlanStatus.Update);
        Assert.Contains(plan.Files, file => file.Kind == FileKind.UserKeybindings && file.Changes.Any(change => change.Contains("新增快捷键", StringComparison.Ordinal)));
        Assert.Contains(plan.Files, file => file.Kind == FileKind.WorkspaceSettings && file.Changes.Any(change => change.Contains("更新 files.autoSave", StringComparison.Ordinal)));
        Assert.Contains(plan.Files, file => file.Kind == FileKind.WorkspaceExtensions && file.Changes.Any(change => change.Contains("recommendations", StringComparison.Ordinal)));
    }

    [Fact]
    public void Validate_ShouldFailWhenProfileNotApplied()
    {
        var userDirectory = Path.Combine(_rootPath, "AppData", "Roaming", "Code", "User");
        Directory.CreateDirectory(userDirectory);
        File.WriteAllText(Path.Combine(userDirectory, "settings.json"), "{ }");
        File.WriteAllText(Path.Combine(userDirectory, "keybindings.json"), "[]");

        var planner = CreatePlanner(userDirectory);
        var profile = new ProfileDocument(
            new JsonObject { ["editor.formatOnSave"] = true },
            null,
            null,
            null,
            null);

        var report = planner.Validate(profile, []);

        Assert.False(report.Success);
        Assert.Contains(report.Issues, issue => issue.Target.EndsWith("settings.json", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Validate_ShouldPassWhenFilesAlreadyMatchProfile()
    {
        var userDirectory = Path.Combine(_rootPath, "AppData", "Roaming", "Code", "User");
        Directory.CreateDirectory(userDirectory);
        File.WriteAllText(Path.Combine(userDirectory, "settings.json"), "{ \"editor.formatOnSave\": true }");
        File.WriteAllText(Path.Combine(userDirectory, "keybindings.json"), "[]");

        var planner = CreatePlanner(userDirectory);
        var profile = new ProfileDocument(
            new JsonObject { ["editor.formatOnSave"] = true },
            null,
            null,
            null,
            null);

        var report = planner.Validate(profile, []);

        Assert.True(report.Success);
    }

    [Fact]
    public void Validate_ShouldSurfaceWorkspaceExtensionWarnings()
    {
        var userDirectory = Path.Combine(_rootPath, "AppData", "Roaming", "Code", "User");
        Directory.CreateDirectory(userDirectory);
        File.WriteAllText(Path.Combine(userDirectory, "settings.json"), "{ }");
        File.WriteAllText(Path.Combine(userDirectory, "keybindings.json"), "[]");

        var workspace = Path.Combine(_rootPath, "workspace-conflict");
        Directory.CreateDirectory(Path.Combine(workspace, ".vscode"));
        File.WriteAllText(
            Path.Combine(workspace, ".vscode", "extensions.json"),
            "{ \"unwantedRecommendations\": [\"openai.chatgpt\"] }");

        var planner = CreatePlanner(userDirectory);
        var profile = new ProfileDocument(
            null,
            null,
            null,
            new JsonArray("openai.chatgpt"),
            null);

        var report = planner.Validate(profile, [workspace]);

        Assert.Contains(report.Warnings, warning => warning.Contains("openai.chatgpt", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_ShouldSurfaceKeybindingWarnings()
    {
        var userDirectory = Path.Combine(_rootPath, "AppData", "Roaming", "Code", "User");
        Directory.CreateDirectory(userDirectory);
        File.WriteAllText(Path.Combine(userDirectory, "settings.json"), "{ }");
        File.WriteAllText(
            Path.Combine(userDirectory, "keybindings.json"),
            """
            [
              {
                "key": "ctrl+alt+c",
                "command": "some.other.command",
                "when": "editorTextFocus || explorerViewletVisible"
              }
            ]
            """);

        var planner = CreatePlanner(userDirectory);
        var profile = BuiltInPresetRegistry.GetRequired("codex-user").Document;

        var report = planner.Validate(profile, []);

        Assert.Contains(report.Warnings, warning => warning.Contains("潜在快捷键冲突", StringComparison.Ordinal));
    }

    public void Dispose()
    {
        if (Directory.Exists(_rootPath))
        {
            Directory.Delete(_rootPath, recursive: true);
        }
    }

    private ConfigPlanner CreatePlanner(string userDirectory)
    {
        var jsoncService = new JsoncFileService();
        var locator = new TestVsCodeLocator(userDirectory);
        return new ConfigPlanner(jsoncService, locator);
    }

    private sealed class TestVsCodeLocator(string userDirectory) : VsCodeLocator
    {
        public override PathSet Resolve(IEnumerable<string> workspacePaths, string? userDirectoryOverride = null)
        {
            var effectiveUserDirectory = string.IsNullOrWhiteSpace(userDirectoryOverride)
                ? userDirectory
                : Path.GetFullPath(userDirectoryOverride);
            var workspaces = workspacePaths
                .Select(Path.GetFullPath)
                .Select(path => new WorkspacePathSet(
                    path,
                    Path.Combine(path, ".vscode"),
                    Path.Combine(path, ".vscode", "settings.json"),
                    Path.Combine(path, ".vscode", "extensions.json")))
                .ToArray();

            return new PathSet(
                effectiveUserDirectory,
                Path.Combine(effectiveUserDirectory, "settings.json"),
                Path.Combine(effectiveUserDirectory, "keybindings.json"),
                workspaces);
        }
    }
}
