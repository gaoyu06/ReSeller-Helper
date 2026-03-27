using Seller.CodexConfigCli.Cli;

namespace Seller.CodexConfigCli.Tests;

public sealed class CliArgumentsTests
{
    [Fact]
    public void Parse_ShouldAllowPresetForPlan()
    {
        var command = CliArguments.Parse(["plan", "--preset", "codex-user"]);

        Assert.Equal(CliCommandName.Plan, command.Name);
        Assert.Equal("codex-user", command.GetOptionalValue("--preset"));
    }

    [Fact]
    public void Parse_ShouldRejectProfileAndPresetTogether()
    {
        Assert.Throws<CliUsageException>(() =>
            CliArguments.Parse(["apply", "--profile", "a.json", "--preset", "codex-user"]));
    }
}
