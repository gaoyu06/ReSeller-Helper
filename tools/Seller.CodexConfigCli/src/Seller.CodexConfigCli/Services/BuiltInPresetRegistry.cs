using System.Text.Json.Nodes;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public static class BuiltInPresetRegistry
{
    private static readonly IReadOnlyList<BuiltInPreset> Presets =
    [
        new BuiltInPreset(
            "codex-user",
            "仅用户级 Codex 配置：常用设置 + 打开命令菜单快捷键。",
            new ProfileDocument(
                new JsonObject
                {
                    ["chatgpt.commentCodeLensEnabled"] = true,
                    ["chatgpt.openOnStartup"] = false,
                    ["chatgpt.followUpQueueMode"] = "queue",
                    ["chatgpt.composerEnterBehavior"] = "enter",
                },
                new JsonArray
                {
                    new JsonObject
                    {
                        ["key"] = "ctrl+alt+c",
                        ["command"] = "chatgpt.openCommandMenu",
                        ["when"] = "editorTextFocus || explorerViewletVisible",
                    },
                },
                null,
                null,
                null)),
        new BuiltInPreset(
            "codex-workspace",
            "仅工作区 Codex 配置：推荐安装 Codex VS Code 扩展。",
            new ProfileDocument(
                null,
                null,
                null,
                new JsonArray("openai.chatgpt"),
                new JsonArray())),
        new BuiltInPreset(
            "codex-full",
            "用户级 + 工作区级 Codex 配置组合。",
            new ProfileDocument(
                new JsonObject
                {
                    ["chatgpt.commentCodeLensEnabled"] = true,
                    ["chatgpt.openOnStartup"] = false,
                    ["chatgpt.followUpQueueMode"] = "queue",
                    ["chatgpt.composerEnterBehavior"] = "enter",
                },
                new JsonArray
                {
                    new JsonObject
                    {
                        ["key"] = "ctrl+alt+c",
                        ["command"] = "chatgpt.openCommandMenu",
                        ["when"] = "editorTextFocus || explorerViewletVisible",
                    },
                },
                null,
                new JsonArray("openai.chatgpt"),
                new JsonArray())),
    ];

    public static IReadOnlyList<BuiltInPreset> List() => Presets;

    public static BuiltInPreset GetRequired(string name)
    {
        var preset = Presets.FirstOrDefault(
            item => string.Equals(item.Name, name, StringComparison.OrdinalIgnoreCase));

        return preset ?? throw new ConfigException($"未知 preset：{name}");
    }
}
