using System.Text.Json;
using System.Text.Json.Nodes;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public sealed class ConfigPlanner(JsoncFileService jsoncFileService, VsCodeLocator locator)
{
    public DetectionReport InspectFiles(IReadOnlyList<string> workspacePaths, string? userDirectoryOverride = null)
    {
        var paths = locator.Resolve(workspacePaths, userDirectoryOverride);
        var files = new List<FileInspection>
        {
            jsoncFileService.Inspect(paths.UserSettingsPath, FileKind.UserSettings, JsonValueKind.Object),
            jsoncFileService.Inspect(paths.UserKeybindingsPath, FileKind.UserKeybindings, JsonValueKind.Array),
        };

        foreach (var workspace in paths.Workspaces)
        {
            files.Add(jsoncFileService.Inspect(workspace.SettingsPath, FileKind.WorkspaceSettings, JsonValueKind.Object));
            files.Add(jsoncFileService.Inspect(workspace.ExtensionsPath, FileKind.WorkspaceExtensions, JsonValueKind.Object));
        }

        return new DetectionReport(paths.UserDirectory, paths.Workspaces.Select(workspace => workspace.RootPath).ToArray(), files);
    }

    public PlanResult CreatePlan(ProfileDocument profile, IReadOnlyList<string> workspacePaths, string? userDirectoryOverride = null)
    {
        var paths = locator.Resolve(workspacePaths, userDirectoryOverride);
        var warnings = new List<string>();
        var files = new List<FilePlan>();

        if (profile.UserSettings is not null)
        {
            files.Add(PlanSettings(paths.UserSettingsPath, FileKind.UserSettings, profile.UserSettings));
        }

        if (profile.UserKeybindings is not null)
        {
            files.Add(PlanKeybindings(paths.UserKeybindingsPath, profile.UserKeybindings));
        }

        if (profile.HasWorkspaceChanges)
        {
            if (paths.Workspaces.Count == 0)
            {
                throw new ConfigException("Profile 包含 workspace 配置，但未传入 --workspace。");
            }

            foreach (var workspace in paths.Workspaces)
            {
                if (!Directory.Exists(workspace.RootPath))
                {
                    warnings.Add($"工作区目录不存在，将按目标路径创建 .vscode：{workspace.RootPath}");
                }

                if (profile.WorkspaceSettings is not null)
                {
                    files.Add(PlanSettings(workspace.SettingsPath, FileKind.WorkspaceSettings, profile.WorkspaceSettings));
                }

                if (profile.WorkspaceRecommendations is not null || profile.WorkspaceUnwantedRecommendations is not null)
                {
                    files.Add(PlanExtensions(
                        workspace.ExtensionsPath,
                        profile.WorkspaceRecommendations,
                        profile.WorkspaceUnwantedRecommendations));
                }
            }
        }

        return new PlanResult(files, warnings);
    }

    public ValidationReport Validate(ProfileDocument? profile, IReadOnlyList<string> workspacePaths, string? userDirectoryOverride = null)
    {
        var detection = InspectFiles(workspacePaths, userDirectoryOverride);
        var issues = new List<ValidationIssue>();
        var warnings = new List<string>();

        if (profile is null)
        {
            return new ValidationReport(detection.Files, issues, warnings);
        }

        var plan = CreatePlan(profile, workspacePaths, userDirectoryOverride);
        warnings.AddRange(plan.Warnings);

        foreach (var file in plan.Files)
        {
            warnings.AddRange(file.Warnings.Select(warning => $"{file.Path}: {warning}"));

            if (file.Status == PlanStatus.Error)
            {
                issues.Add(new ValidationIssue(file.Path, "存在错误，无法满足目标配置。"));
                continue;
            }

            if (file.Status != PlanStatus.Unchanged)
            {
                issues.Add(new ValidationIssue(file.Path, "当前文件尚未达到期望状态。"));
            }
        }

        return new ValidationReport(detection.Files, issues, warnings);
    }

    private FilePlan PlanSettings(string path, FileKind kind, JsonObject desiredSettings)
    {
        var (existingNode, exists) = jsoncFileService.LoadOrCreateDefault(path, JsonValueKind.Object);
        var merged = MergeObjects(existingNode.AsObject(), desiredSettings);
        var changes = DescribeObjectChanges(existingNode.AsObject(), merged);
        var status = !exists ? PlanStatus.Create : changes.Count == 0 ? PlanStatus.Unchanged : PlanStatus.Update;

        return new FilePlan(kind, path, status, changes, []) { DesiredContent = merged };
    }

    private FilePlan PlanKeybindings(string path, JsonArray desiredKeybindings)
    {
        var (existingNode, exists) = jsoncFileService.LoadOrCreateDefault(path, JsonValueKind.Array);
        var warnings = new List<string>();
        var changes = new List<string>();
        var merged = MergeKeybindings(existingNode.AsArray(), desiredKeybindings, warnings, changes);
        var status = !exists ? PlanStatus.Create : changes.Count == 0 ? PlanStatus.Unchanged : PlanStatus.Update;

        return new FilePlan(FileKind.UserKeybindings, path, status, changes, warnings) { DesiredContent = merged };
    }

    private FilePlan PlanExtensions(string path, JsonArray? desiredRecommendations, JsonArray? desiredUnwantedRecommendations)
    {
        var (existingNode, exists) = jsoncFileService.LoadOrCreateDefault(path, JsonValueKind.Object);
        var current = existingNode.AsObject();
        var warnings = new List<string>();
        var merged = MergeExtensions(current, desiredRecommendations, desiredUnwantedRecommendations, warnings);
        var changes = DescribeObjectChanges(current, merged);
        var status = !exists ? PlanStatus.Create : changes.Count == 0 ? PlanStatus.Unchanged : PlanStatus.Update;

        return new FilePlan(FileKind.WorkspaceExtensions, path, status, changes, warnings) { DesiredContent = merged };
    }

    private static JsonObject MergeObjects(JsonObject current, JsonObject desired)
    {
        var result = JsoncFileService.CloneObject(current);

        foreach (var kvp in desired)
        {
            if (kvp.Value is JsonObject desiredChild &&
                result[kvp.Key] is JsonObject existingChild)
            {
                result[kvp.Key] = MergeObjects(existingChild, desiredChild);
                continue;
            }

            result[kvp.Key] = kvp.Value?.DeepClone();
        }

        return result;
    }

    private static JsonArray MergeKeybindings(
        JsonArray current,
        JsonArray desired,
        ICollection<string> warnings,
        ICollection<string> changes)
    {
        var result = JsoncFileService.CloneArray(current);

        foreach (var desiredNode in desired)
        {
            if (desiredNode is not JsonObject desiredBinding)
            {
                continue;
            }

            var desiredSignature = BuildKeybindingSignature(desiredBinding);
            var desiredLooseSignature = BuildLooseKeybindingSignature(desiredBinding);
            var exactMatchIndex = -1;
            var looseConflictIndex = -1;

            for (var i = 0; i < result.Count; i++)
            {
                if (result[i] is not JsonObject existingBinding)
                {
                    continue;
                }

                if (BuildKeybindingSignature(existingBinding) == desiredSignature)
                {
                    exactMatchIndex = i;
                    break;
                }

                if (BuildLooseKeybindingSignature(existingBinding) == desiredLooseSignature)
                {
                    looseConflictIndex = i;
                }
            }

            if (exactMatchIndex >= 0)
            {
                var currentBinding = result[exactMatchIndex]!.AsObject();
                if (!JsonNode.DeepEquals(currentBinding, desiredBinding))
                {
                    result[exactMatchIndex] = desiredBinding.DeepClone();
                    changes.Add($"更新快捷键：{desiredBinding["key"]} -> {desiredBinding["command"]}");
                }

                continue;
            }

            if (looseConflictIndex >= 0 && result[looseConflictIndex] is JsonObject conflictBinding)
            {
                warnings.Add(
                    $"发现潜在快捷键冲突：{desiredBinding["key"]} / when={desiredBinding["when"] ?? "null"}，现有命令={conflictBinding["command"]}");
            }

            result.Add(desiredBinding.DeepClone());
            changes.Add($"新增快捷键：{desiredBinding["key"]} -> {desiredBinding["command"]}");
        }

        return result;
    }

    private static JsonObject MergeExtensions(
        JsonObject current,
        JsonArray? desiredRecommendations,
        JsonArray? desiredUnwantedRecommendations,
        ICollection<string> warnings)
    {
        var result = JsoncFileService.CloneObject(current);

        if (desiredRecommendations is not null)
        {
            result["recommendations"] = MergeStringArray(
                result["recommendations"] as JsonArray,
                desiredRecommendations);
        }

        if (desiredUnwantedRecommendations is not null)
        {
            result["unwantedRecommendations"] = MergeStringArray(
                result["unwantedRecommendations"] as JsonArray,
                desiredUnwantedRecommendations);
        }

        var recommendations = (result["recommendations"] as JsonArray) ?? [];
        var unwantedRecommendations = (result["unwantedRecommendations"] as JsonArray) ?? [];
        var duplicates = recommendations
            .Where(node => node is not null)
            .Select(node => node!.GetValue<string>())
            .Intersect(
                unwantedRecommendations
                    .Where(node => node is not null)
                    .Select(node => node!.GetValue<string>()),
                StringComparer.OrdinalIgnoreCase)
            .OrderBy(value => value, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        foreach (var duplicate in duplicates)
        {
            warnings.Add($"扩展 {duplicate} 同时存在于 recommendations 与 unwantedRecommendations。");
        }

        return result;
    }

    private static JsonArray MergeStringArray(JsonArray? current, JsonArray desired)
    {
        var merged = current is null ? [] : JsoncFileService.CloneArray(current);
        var existing = merged
            .Where(node => node is not null)
            .Select(node => node!.GetValue<string>())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var node in desired)
        {
            if (node is null)
            {
                continue;
            }

            var value = node.GetValue<string>();
            if (existing.Add(value))
            {
                merged.Add(value);
            }
        }

        return merged;
    }

    private static string BuildKeybindingSignature(JsonObject binding)
    {
        var key = binding["key"]?.GetValue<string>() ?? string.Empty;
        var command = binding["command"]?.GetValue<string>() ?? string.Empty;
        var when = binding["when"]?.GetValue<string>() ?? string.Empty;
        return $"{key}|{command}|{when}";
    }

    private static string BuildLooseKeybindingSignature(JsonObject binding)
    {
        var key = binding["key"]?.GetValue<string>() ?? string.Empty;
        var when = binding["when"]?.GetValue<string>() ?? string.Empty;
        return $"{key}|{when}";
    }

    private static List<string> DescribeObjectChanges(JsonObject current, JsonObject merged)
    {
        var changes = new List<string>();
        DescribeObjectChangesRecursive(current, merged, string.Empty, changes);
        return changes;
    }

    private static void DescribeObjectChangesRecursive(JsonObject current, JsonObject merged, string prefix, ICollection<string> changes)
    {
        var propertyNames = current.Select(kvp => kvp.Key)
            .Concat(merged.Select(kvp => kvp.Key))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(name => name, StringComparer.Ordinal);

        foreach (var name in propertyNames)
        {
            var path = string.IsNullOrEmpty(prefix) ? name : $"{prefix}.{name}";
            var hasCurrent = current.TryGetPropertyValue(name, out var currentValue);
            var hasMerged = merged.TryGetPropertyValue(name, out var mergedValue);

            if (!hasCurrent && hasMerged)
            {
                changes.Add($"新增 {path}");
                continue;
            }

            if (hasCurrent && !hasMerged)
            {
                changes.Add($"删除 {path}");
                continue;
            }

            if (currentValue is JsonObject currentObject && mergedValue is JsonObject mergedObject)
            {
                DescribeObjectChangesRecursive(currentObject, mergedObject, path, changes);
                continue;
            }

            if (!JsonNode.DeepEquals(currentValue, mergedValue))
            {
                changes.Add($"更新 {path}");
            }
        }
    }
}
