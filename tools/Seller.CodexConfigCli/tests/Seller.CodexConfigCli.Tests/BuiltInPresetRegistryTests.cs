using Seller.CodexConfigCli.Services;

namespace Seller.CodexConfigCli.Tests;

public sealed class BuiltInPresetRegistryTests
{
    [Fact]
    public void List_ShouldContainCodexPresets()
    {
        var presets = BuiltInPresetRegistry.List();

        Assert.Contains(presets, preset => preset.Name == "codex-user");
        Assert.Contains(presets, preset => preset.Name == "codex-workspace");
        Assert.Contains(presets, preset => preset.Name == "codex-full");
    }

    [Fact]
    public void GetRequired_ShouldReturnWorkspaceRecommendation()
    {
        var preset = BuiltInPresetRegistry.GetRequired("codex-full");

        Assert.NotNull(preset.Document.WorkspaceRecommendations);
        Assert.Contains(
            preset.Document.WorkspaceRecommendations!,
            node => node?.GetValue<string>() == "openai.chatgpt");
    }

    [Fact]
    public void ProfileFormatter_ShouldEmitUserFacingProfileShape()
    {
        var preset = BuiltInPresetRegistry.GetRequired("codex-full");

        var json = ProfileFormatter.Serialize(preset.Document);

        Assert.Contains("\"user\"", json, StringComparison.Ordinal);
        Assert.Contains("\"workspace\"", json, StringComparison.Ordinal);
        Assert.DoesNotContain("UserSettings", json, StringComparison.Ordinal);
    }
}
