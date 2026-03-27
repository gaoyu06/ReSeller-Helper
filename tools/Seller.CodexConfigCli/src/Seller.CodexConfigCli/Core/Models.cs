using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Seller.CodexConfigCli.Core;

public enum FileKind
{
    UserSettings,
    UserKeybindings,
    WorkspaceSettings,
    WorkspaceExtensions,
}

public enum PlanStatus
{
    Unchanged,
    Create,
    Update,
    Error,
}

public sealed record ProfileDocument(
    JsonObject? UserSettings,
    JsonArray? UserKeybindings,
    JsonObject? WorkspaceSettings,
    JsonArray? WorkspaceRecommendations,
    JsonArray? WorkspaceUnwantedRecommendations)
{
    public bool HasWorkspaceChanges =>
        WorkspaceSettings is not null ||
        WorkspaceRecommendations is not null ||
        WorkspaceUnwantedRecommendations is not null;
}

public sealed record FileInspection(
    FileKind Kind,
    string Path,
    bool Exists,
    bool ParseSucceeded,
    string? Message);

public sealed record DetectionReport(
    string UserDirectory,
    IReadOnlyList<string> Workspaces,
    IReadOnlyList<FileInspection> Files)
{
    public bool Success => Files.All(file => file.ParseSucceeded);
}

public sealed record FilePlan(
    FileKind Kind,
    string Path,
    PlanStatus Status,
    IReadOnlyList<string> Changes,
    IReadOnlyList<string> Warnings)
{
    [JsonIgnore]
    public JsonNode? DesiredContent { get; init; }
}

public sealed record PlanResult(
    IReadOnlyList<FilePlan> Files,
    IReadOnlyList<string> Warnings)
{
    public bool Success => Files.All(file => file.Status != PlanStatus.Error);
}

public sealed record AppliedFileResult(
    FileKind Kind,
    string Path,
    PlanStatus Status,
    string? BackupPath,
    IReadOnlyList<string> Changes);

public sealed record ApplyResult(
    IReadOnlyList<AppliedFileResult> Files,
    IReadOnlyList<string> Warnings)
{
    public bool Success => Files.All(file => file.Status != PlanStatus.Error);
}

public sealed record ValidationIssue(
    string Target,
    string Message);

public sealed record ValidationReport(
    IReadOnlyList<FileInspection> Files,
    IReadOnlyList<ValidationIssue> Issues,
    IReadOnlyList<string> Warnings)
{
    public bool Success => Files.All(file => file.ParseSucceeded) && Issues.Count == 0;
}

public sealed record PathSet(
    string UserDirectory,
    string UserSettingsPath,
    string UserKeybindingsPath,
    IReadOnlyList<WorkspacePathSet> Workspaces);

public sealed record WorkspacePathSet(
    string RootPath,
    string VsCodeDirectory,
    string SettingsPath,
    string ExtensionsPath);
