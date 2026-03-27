using Seller.CodexConfigCli.Cli;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public sealed class ProfileResolver(ProfileLoader profileLoader)
{
    public ProfileDocument Resolve(CliCommand command)
    {
        var profile = ResolveOptional(command);
        return profile ?? throw new CliUsageException("缺少 --profile 或 --preset。");
    }

    public ProfileDocument? ResolveOptional(CliCommand command)
    {
        var profilePath = command.GetOptionalValue("--profile");
        if (!string.IsNullOrWhiteSpace(profilePath))
        {
            return profileLoader.Load(profilePath);
        }

        var presetName = command.GetOptionalValue("--preset");
        if (!string.IsNullOrWhiteSpace(presetName))
        {
            return BuiltInPresetRegistry.GetRequired(presetName).Document;
        }

        return null;
    }

    public string ResolvePresetText(string presetName)
    {
        var preset = BuiltInPresetRegistry.GetRequired(presetName);
        return ProfileFormatter.Serialize(preset.Document);
    }
}
