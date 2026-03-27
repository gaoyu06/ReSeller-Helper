using Seller.CodexConfigCli.Core;
using Seller.CodexConfigCli.Services;

namespace Seller.CodexConfigCli.Tests;

public sealed class ProfileLoaderTests : IDisposable
{
    private readonly string _rootPath;

    public ProfileLoaderTests()
    {
        _rootPath = Path.Combine(Path.GetTempPath(), "Seller.CodexConfigCli.ProfileLoaderTests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_rootPath);
    }

    [Fact]
    public void Load_ShouldReadUserAndWorkspaceSections()
    {
        var path = Path.Combine(_rootPath, "profile.json");
        File.WriteAllText(path,
            """
            {
              "user": {
                "settings": {
                  "editor.formatOnSave": true
                },
                "keybindings": [
                  {
                    "key": "ctrl+alt+c",
                    "command": "codex.open"
                  }
                ]
              },
              "workspace": {
                "settings": {
                  "files.autoSave": "afterDelay"
                },
                "extensions": {
                  "recommendations": [
                    "publisher.codex"
                  ]
                }
              }
            }
            """);

        var loader = new ProfileLoader(new JsoncFileService());
        var profile = loader.Load(path);

        Assert.NotNull(profile.UserSettings);
        Assert.NotNull(profile.UserKeybindings);
        Assert.NotNull(profile.WorkspaceSettings);
        Assert.NotNull(profile.WorkspaceRecommendations);
        Assert.True(profile.HasWorkspaceChanges);
    }

    [Fact]
    public void Load_ShouldAcceptJsonc()
    {
        var path = Path.Combine(_rootPath, "profile.json");
        File.WriteAllText(path,
            """
            {
              // comment
              "user": {
                "settings": {
                  "editor.formatOnSave": true,
                }
              }
            }
            """);

        var loader = new ProfileLoader(new JsoncFileService());
        var profile = loader.Load(path);

        Assert.NotNull(profile.UserSettings);
    }

    [Fact]
    public void Load_ShouldRejectConflictingKeybindings()
    {
        var path = Path.Combine(_rootPath, "conflict-profile.json");
        File.WriteAllText(path,
            """
            {
              "user": {
                "keybindings": [
                  {
                    "key": "ctrl+alt+c",
                    "command": "chatgpt.openSidebar"
                  },
                  {
                    "key": "ctrl+alt+c",
                    "command": "chatgpt.openCommandMenu"
                  }
                ]
              }
            }
            """);

        var loader = new ProfileLoader(new JsoncFileService());

        var ex = Assert.Throws<ConfigException>(() => loader.Load(path));
        Assert.Contains("绑定了多个命令", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void Load_ShouldRejectExtensionInBothRecommendationLists()
    {
        var path = Path.Combine(_rootPath, "extensions-conflict-profile.json");
        File.WriteAllText(path,
            """
            {
              "workspace": {
                "extensions": {
                  "recommendations": ["openai.chatgpt"],
                  "unwantedRecommendations": ["openai.chatgpt"]
                }
              }
            }
            """);

        var loader = new ProfileLoader(new JsoncFileService());

        var ex = Assert.Throws<ConfigException>(() => loader.Load(path));
        Assert.Contains("同时出现在 recommendations 与 unwantedRecommendations", ex.Message, StringComparison.Ordinal);
    }

    public void Dispose()
    {
        if (Directory.Exists(_rootPath))
        {
            Directory.Delete(_rootPath, recursive: true);
        }
    }
}
