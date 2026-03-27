using Seller.CodexConfigCli.Core;
using Seller.CodexConfigCli.Services;

namespace Seller.CodexConfigCli.Cli;

public static class CliApplication
{
    public static async Task<int> RunAsync(string[] args)
    {
        CliCommand command;

        try
        {
            command = CliArguments.Parse(args);
        }
        catch (CliUsageException ex)
        {
            Console.Error.WriteLine($"参数错误：{ex.Message}");
            Console.Error.WriteLine();
            Console.Error.WriteLine(HelpText.Build());
            return ExitCodes.InvalidArguments;
        }

        var jsoncService = new JsoncFileService();
        var locator = new VsCodeLocator();
        var profileLoader = new ProfileLoader(jsoncService);
        var profileResolver = new ProfileResolver(profileLoader);
        var planner = new ConfigPlanner(jsoncService, locator);
        var applier = new ConfigApplier(jsoncService, planner);
        var writer = new ConsoleReportWriter();

        try
        {
            switch (command.Name)
            {
                case CliCommandName.Help:
                    Console.WriteLine(HelpText.Build());
                    return ExitCodes.Success;

                case CliCommandName.ListPresets:
                    writer.WritePresets(BuiltInPresetRegistry.List(), command.HasFlag("--json"));
                    return ExitCodes.Success;

                case CliCommandName.SampleProfile:
                {
                    var output = command.GetOptionalValue("--output");
                    var presetName = command.GetOptionalValue("--preset");
                    var content = string.IsNullOrWhiteSpace(presetName)
                        ? SampleProfileFactory.Create()
                        : profileResolver.ResolvePresetText(presetName);

                    if (string.IsNullOrWhiteSpace(output))
                    {
                        Console.WriteLine(content);
                    }
                    else
                    {
                        var fullPath = Path.GetFullPath(output);
                        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
                        await File.WriteAllTextAsync(fullPath, content);
                        Console.WriteLine($"已生成示例配置文件：{fullPath}");
                    }

                    return ExitCodes.Success;
                }

                case CliCommandName.Detect:
                {
                    var report = planner.InspectFiles(command.GetValues("--workspace"), command.GetOptionalValue("--user-dir"));
                    writer.WriteDetection(report, command.HasFlag("--json"));
                    return report.Success ? ExitCodes.Success : ExitCodes.ValidationFailed;
                }

                case CliCommandName.Plan:
                {
                    var profile = profileResolver.Resolve(command);
                    var plan = planner.CreatePlan(profile, command.GetValues("--workspace"), command.GetOptionalValue("--user-dir"));
                    writer.WritePlan(plan, command.HasFlag("--json"));
                    return plan.Success ? ExitCodes.Success : ExitCodes.ValidationFailed;
                }

                case CliCommandName.Apply:
                {
                    var profile = profileResolver.Resolve(command);
                    var result = await applier.ApplyAsync(profile, command.GetValues("--workspace"), command.GetOptionalValue("--user-dir"));
                    writer.WriteApplyResult(result, command.HasFlag("--json"));
                    return result.Success ? ExitCodes.Success : ExitCodes.ValidationFailed;
                }

                case CliCommandName.Validate:
                {
                    var profile = profileResolver.ResolveOptional(command);

                    var report = planner.Validate(profile, command.GetValues("--workspace"), command.GetOptionalValue("--user-dir"));
                    writer.WriteValidation(report, command.HasFlag("--json"));
                    return report.Success ? ExitCodes.Success : ExitCodes.ValidationFailed;
                }

                default:
                    Console.WriteLine(HelpText.Build());
                    return ExitCodes.InvalidArguments;
            }
        }
        catch (CliUsageException ex)
        {
            Console.Error.WriteLine($"参数错误：{ex.Message}");
            return ExitCodes.InvalidArguments;
        }
        catch (ConfigException ex)
        {
            Console.Error.WriteLine($"处理失败：{ex.Message}");
            return ExitCodes.ValidationFailed;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"未处理异常：{ex.Message}");
            return ExitCodes.UnhandledError;
        }
    }
}
