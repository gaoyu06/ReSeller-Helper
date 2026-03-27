using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public sealed class ConfigApplier(JsoncFileService jsoncFileService, ConfigPlanner planner)
{
    public async Task<ApplyResult> ApplyAsync(ProfileDocument profile, IReadOnlyList<string> workspacePaths, string? userDirectoryOverride = null)
    {
        var plan = planner.CreatePlan(profile, workspacePaths, userDirectoryOverride);
        var results = new List<AppliedFileResult>();

        foreach (var file in plan.Files)
        {
            if (file.Status == PlanStatus.Error)
            {
                results.Add(new AppliedFileResult(file.Kind, file.Path, file.Status, null, file.Changes));
                continue;
            }

            if (file.Status == PlanStatus.Unchanged || file.DesiredContent is null)
            {
                results.Add(new AppliedFileResult(file.Kind, file.Path, file.Status, null, file.Changes));
                continue;
            }

            var backupPath = await jsoncFileService.WriteAsync(file.Path, file.DesiredContent);
            results.Add(new AppliedFileResult(file.Kind, file.Path, file.Status, backupPath, file.Changes));
        }

        return new ApplyResult(results, plan.Warnings);
    }
}
