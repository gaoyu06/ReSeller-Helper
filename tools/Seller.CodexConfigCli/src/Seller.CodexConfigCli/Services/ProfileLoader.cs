using System.Text.Json;
using System.Text.Json.Nodes;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public sealed class ProfileLoader(JsoncFileService jsoncFileService)
{
    public ProfileDocument Load(string path)
    {
        var (node, _) = jsoncFileService.LoadOrCreateDefault(path, JsonValueKind.Object);
        return ParseDocument(node.AsObject(), path);
    }

    public ProfileDocument LoadFromContent(string content, string sourceName)
    {
        JsonNode node;

        try
        {
            node = JsonNode.Parse(
                content,
                documentOptions: new JsonDocumentOptions
                {
                    CommentHandling = JsonCommentHandling.Skip,
                    AllowTrailingCommas = true,
                }) ?? throw new ConfigException($"Profile {sourceName} 为空。");
        }
        catch (JsonException ex)
        {
            throw new ConfigException($"Profile {sourceName} 不是合法的 JSON/JSONC：{ex.Message}");
        }

        if (node is not JsonObject root)
        {
            throw new ConfigException($"Profile {sourceName} 根节点必须是对象。");
        }

        return ParseDocument(root, sourceName);
    }

    private static ProfileDocument ParseDocument(JsonObject root, string sourceName)
    {
        var user = root["user"] as JsonObject;
        var workspace = root["workspace"] as JsonObject;

        EnsureObjectOrNull(root, "user");
        EnsureObjectOrNull(root, "workspace");

        var userSettings = ReadObject(user, "settings");
        var userKeybindings = ReadArray(user, "keybindings");
        ValidateKeybindings(userKeybindings, $"{sourceName}: user.keybindings");

        var workspaceSettings = ReadObject(workspace, "settings");
        var extensions = ReadObject(workspace, "extensions");
        var workspaceRecommendations = ReadStringArray(extensions, "recommendations");
        var workspaceUnwantedRecommendations = ReadStringArray(extensions, "unwantedRecommendations");

        if (userSettings is null &&
            userKeybindings is null &&
            workspaceSettings is null &&
            workspaceRecommendations is null &&
            workspaceUnwantedRecommendations is null)
        {
            throw new ConfigException("Profile 为空，没有可应用的配置内容。");
        }

        ValidateKeybindingUniqueness(userKeybindings, $"{sourceName}: user.keybindings");
        ValidateExtensionUniqueness(workspaceRecommendations, workspaceUnwantedRecommendations, sourceName);

        return new ProfileDocument(
            userSettings is null ? null : JsoncFileService.CloneObject(userSettings),
            userKeybindings is null ? null : JsoncFileService.CloneArray(userKeybindings),
            workspaceSettings is null ? null : JsoncFileService.CloneObject(workspaceSettings),
            workspaceRecommendations is null ? null : JsoncFileService.CloneArray(workspaceRecommendations),
            workspaceUnwantedRecommendations is null ? null : JsoncFileService.CloneArray(workspaceUnwantedRecommendations));
    }

    private static void EnsureObjectOrNull(JsonObject root, string propertyName)
    {
        var node = root[propertyName];
        if (node is null)
        {
            return;
        }

        if (node is not JsonObject)
        {
            throw new ConfigException($"Profile 字段 {propertyName} 必须是对象。");
        }
    }

    private static JsonObject? ReadObject(JsonObject? parent, string propertyName)
    {
        if (parent is null || parent[propertyName] is null)
        {
            return null;
        }

        return parent[propertyName] as JsonObject
            ?? throw new ConfigException($"Profile 字段 {propertyName} 必须是对象。");
    }

    private static JsonArray? ReadArray(JsonObject? parent, string propertyName)
    {
        if (parent is null || parent[propertyName] is null)
        {
            return null;
        }

        return parent[propertyName] as JsonArray
            ?? throw new ConfigException($"Profile 字段 {propertyName} 必须是数组。");
    }

    private static JsonArray? ReadStringArray(JsonObject? parent, string propertyName)
    {
        var array = ReadArray(parent, propertyName);
        if (array is null)
        {
            return null;
        }

        foreach (var node in array)
        {
            if (node is null || node.GetValueKind() != JsonValueKind.String)
            {
                throw new ConfigException($"Profile 字段 {propertyName} 只能包含字符串。");
            }
        }

        return array;
    }

    private static void ValidateKeybindings(JsonArray? keybindings, string context)
    {
        if (keybindings is null)
        {
            return;
        }

        for (var i = 0; i < keybindings.Count; i++)
        {
            if (keybindings[i] is not JsonObject binding)
            {
                throw new ConfigException($"{context}[{i}] 必须是对象。");
            }

            if (binding["key"]?.GetValueKind() != JsonValueKind.String)
            {
                throw new ConfigException($"{context}[{i}].key 必须是字符串。");
            }

            if (binding["command"]?.GetValueKind() != JsonValueKind.String)
            {
                throw new ConfigException($"{context}[{i}].command 必须是字符串。");
            }
        }
    }

    private static void ValidateKeybindingUniqueness(JsonArray? keybindings, string context)
    {
        if (keybindings is null)
        {
            return;
        }

        var seen = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        for (var i = 0; i < keybindings.Count; i++)
        {
            var binding = (JsonObject)keybindings[i]!;
            var key = binding["key"]!.GetValue<string>();
            var when = binding["when"]?.GetValue<string>() ?? string.Empty;
            var command = binding["command"]!.GetValue<string>();
            var signature = $"{key}|{when}";

            if (seen.TryGetValue(signature, out var existingCommand) && !string.Equals(existingCommand, command, StringComparison.Ordinal))
            {
                throw new ConfigException($"{context} 存在冲突：快捷键 {key} 在相同 when 条件下绑定了多个命令。");
            }

            seen[signature] = command;
        }
    }

    private static void ValidateExtensionUniqueness(JsonArray? recommendations, JsonArray? unwantedRecommendations, string sourceName)
    {
        if (recommendations is null || unwantedRecommendations is null)
        {
            return;
        }

        var recommended = recommendations
            .Where(node => node is not null)
            .Select(node => node!.GetValue<string>())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var node in unwantedRecommendations)
        {
            if (node is null)
            {
                continue;
            }

            var value = node.GetValue<string>();
            if (recommended.Contains(value))
            {
                throw new ConfigException($"Profile {sourceName} 中，扩展 {value} 同时出现在 recommendations 与 unwantedRecommendations。");
            }
        }
    }
}
