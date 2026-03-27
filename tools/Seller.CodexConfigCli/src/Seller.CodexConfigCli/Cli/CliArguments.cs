namespace Seller.CodexConfigCli.Cli;

public sealed class CliCommand
{
    private readonly Dictionary<string, List<string>> _options = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<string> _flags = new(StringComparer.OrdinalIgnoreCase);

    public CliCommand(CliCommandName name)
    {
        Name = name;
    }

    public CliCommandName Name { get; }

    public void AddOption(string name, string value)
    {
        if (!_options.TryGetValue(name, out var values))
        {
            values = [];
            _options[name] = values;
        }

        values.Add(value);
    }

    public void AddFlag(string name)
    {
        _flags.Add(name);
    }

    public bool HasFlag(string name) => _flags.Contains(name);

    public string GetRequiredValue(string name)
    {
        var value = GetOptionalValue(name);
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new CliUsageException($"缺少必填参数 {name}。");
        }

        return value;
    }

    public string? GetOptionalValue(string name)
        => _options.TryGetValue(name, out var values) ? values.LastOrDefault() : null;

    public IReadOnlyList<string> GetValues(string name)
        => _options.TryGetValue(name, out var values) ? values : [];
}

public enum CliCommandName
{
    Help,
    Detect,
    Plan,
    Apply,
    Validate,
    ListPresets,
    SampleProfile,
}

public sealed class CliUsageException(string message) : Exception(message);

public static class CliArguments
{
    private static readonly HashSet<string> SupportedCommands =
    [
        "help",
        "detect",
        "plan",
        "apply",
        "validate",
        "list-presets",
        "sample-profile",
    ];

    private static readonly HashSet<string> ValueOptions =
    [
        "--profile",
        "--workspace",
        "--output",
        "--user-dir",
        "--preset",
    ];

    private static readonly HashSet<string> FlagOptions =
    [
        "--json",
    ];

    public static CliCommand Parse(string[] args)
    {
        if (args.Length == 0)
        {
            return new CliCommand(CliCommandName.Help);
        }

        var commandName = args[0].Trim();
        if (!SupportedCommands.Contains(commandName))
        {
            throw new CliUsageException($"未知命令：{commandName}");
        }

        var command = new CliCommand(ParseCommandName(commandName));
        var index = 1;

        while (index < args.Length)
        {
            var token = args[index];
            if (FlagOptions.Contains(token))
            {
                command.AddFlag(token);
                index++;
                continue;
            }

            if (ValueOptions.Contains(token))
            {
                if (index + 1 >= args.Length)
                {
                    throw new CliUsageException($"参数 {token} 缺少值。");
                }

                command.AddOption(token, args[index + 1]);
                index += 2;
                continue;
            }

            throw new CliUsageException($"无法识别的参数：{token}");
        }

        ValidateCommand(command);
        return command;
    }

    private static CliCommandName ParseCommandName(string name) => name switch
    {
        "detect" => CliCommandName.Detect,
        "plan" => CliCommandName.Plan,
        "apply" => CliCommandName.Apply,
        "validate" => CliCommandName.Validate,
        "list-presets" => CliCommandName.ListPresets,
        "sample-profile" => CliCommandName.SampleProfile,
        _ => CliCommandName.Help,
    };

    private static void ValidateCommand(CliCommand command)
    {
        var hasProfile = !string.IsNullOrWhiteSpace(command.GetOptionalValue("--profile"));
        var hasPreset = !string.IsNullOrWhiteSpace(command.GetOptionalValue("--preset"));

        if (hasProfile && hasPreset)
        {
            throw new CliUsageException("--profile 与 --preset 不能同时使用。");
        }

        switch (command.Name)
        {
            case CliCommandName.Plan:
            case CliCommandName.Apply:
                if (!hasProfile && !hasPreset)
                {
                    throw new CliUsageException("plan/apply 至少需要提供 --profile 或 --preset 之一。");
                }
                break;
            case CliCommandName.Validate:
                break;
        }
    }
}
