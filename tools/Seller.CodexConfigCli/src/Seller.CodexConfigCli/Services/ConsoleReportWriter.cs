using System.Text.Json;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public sealed class ConsoleReportWriter
{
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true,
    };

    public void WriteDetection(DetectionReport report, bool asJson)
    {
        if (asJson)
        {
            Console.WriteLine(JsonSerializer.Serialize(report, _jsonOptions));
            return;
        }

        Console.WriteLine($"VS Code 用户目录：{report.UserDirectory}");
        if (report.Workspaces.Count > 0)
        {
            Console.WriteLine("工作区：");
            foreach (var workspace in report.Workspaces)
            {
                Console.WriteLine($"  - {workspace}");
            }
        }

        Console.WriteLine();
        foreach (var file in report.Files)
        {
            Console.WriteLine($"{KindLabel(file.Kind)}");
            Console.WriteLine($"  路径：{file.Path}");
            Console.WriteLine($"  存在：{(file.Exists ? "是" : "否")}");
            Console.WriteLine($"  可解析：{(file.ParseSucceeded ? "是" : "否")}");
            if (!string.IsNullOrWhiteSpace(file.Message))
            {
                Console.WriteLine($"  说明：{file.Message}");
            }

            Console.WriteLine();
        }
    }

    public void WritePresets(IReadOnlyList<BuiltInPreset> presets, bool asJson)
    {
        if (asJson)
        {
            Console.WriteLine(JsonSerializer.Serialize(presets, _jsonOptions));
            return;
        }

        Console.WriteLine("可用内置 preset：");
        foreach (var preset in presets)
        {
            Console.WriteLine($"- {preset.Name}");
            Console.WriteLine($"  {preset.Description}");
        }
    }

    public void WritePlan(PlanResult plan, bool asJson)
    {
        if (asJson)
        {
            Console.WriteLine(JsonSerializer.Serialize(plan, _jsonOptions));
            return;
        }

        foreach (var warning in plan.Warnings)
        {
            Console.WriteLine($"警告：{warning}");
        }

        foreach (var file in plan.Files)
        {
            Console.WriteLine($"{KindLabel(file.Kind)}");
            Console.WriteLine($"  路径：{file.Path}");
            Console.WriteLine($"  状态：{StatusLabel(file.Status)}");

            if (file.Changes.Count > 0)
            {
                Console.WriteLine("  变更：");
                foreach (var change in file.Changes)
                {
                    Console.WriteLine($"    - {change}");
                }
            }

            if (file.Warnings.Count > 0)
            {
                Console.WriteLine("  警告：");
                foreach (var warning in file.Warnings)
                {
                    Console.WriteLine($"    - {warning}");
                }
            }

            Console.WriteLine();
        }
    }

    public void WriteApplyResult(ApplyResult result, bool asJson)
    {
        if (asJson)
        {
            Console.WriteLine(JsonSerializer.Serialize(result, _jsonOptions));
            return;
        }

        foreach (var warning in result.Warnings)
        {
            Console.WriteLine($"警告：{warning}");
        }

        foreach (var file in result.Files)
        {
            Console.WriteLine($"{KindLabel(file.Kind)}");
            Console.WriteLine($"  路径：{file.Path}");
            Console.WriteLine($"  状态：{StatusLabel(file.Status)}");
            if (!string.IsNullOrWhiteSpace(file.BackupPath))
            {
                Console.WriteLine($"  备份：{file.BackupPath}");
            }

            if (file.Changes.Count > 0)
            {
                Console.WriteLine("  已执行变更：");
                foreach (var change in file.Changes)
                {
                    Console.WriteLine($"    - {change}");
                }
            }

            Console.WriteLine();
        }
    }

    public void WriteValidation(ValidationReport report, bool asJson)
    {
        if (asJson)
        {
            Console.WriteLine(JsonSerializer.Serialize(report, _jsonOptions));
            return;
        }

        Console.WriteLine(report.Success ? "校验通过。" : "校验失败。");
        Console.WriteLine();

        foreach (var file in report.Files)
        {
            Console.WriteLine($"{KindLabel(file.Kind)} -> {(file.ParseSucceeded ? "可解析" : "不可解析")}");
            Console.WriteLine($"  路径：{file.Path}");
            if (!string.IsNullOrWhiteSpace(file.Message))
            {
                Console.WriteLine($"  说明：{file.Message}");
            }
        }

        if (report.Issues.Count > 0)
        {
            Console.WriteLine();
            Console.WriteLine("问题：");
            foreach (var issue in report.Issues)
            {
                Console.WriteLine($"  - {issue.Target}: {issue.Message}");
            }
        }

        if (report.Warnings.Count > 0)
        {
            Console.WriteLine();
            Console.WriteLine("警告：");
            foreach (var warning in report.Warnings)
            {
                Console.WriteLine($"  - {warning}");
            }
        }
    }

    private static string KindLabel(FileKind kind) => kind switch
    {
        FileKind.UserSettings => "用户 settings.json",
        FileKind.UserKeybindings => "用户 keybindings.json",
        FileKind.WorkspaceSettings => "工作区 settings.json",
        FileKind.WorkspaceExtensions => "工作区 extensions.json",
        _ => kind.ToString(),
    };

    private static string StatusLabel(PlanStatus status) => status switch
    {
        PlanStatus.Unchanged => "无变更",
        PlanStatus.Create => "将创建",
        PlanStatus.Update => "将更新",
        PlanStatus.Error => "错误",
        _ => status.ToString(),
    };
}
