namespace Seller.CodexConfigCli.Cli;

public static class HelpText
{
    public static string Build() =>
        """
        Seller.CodexConfigCli

        用途：
          检测、规划、写入并校验 VS Code 用户级 / 工作区级配置文件。

        命令：
          detect [--workspace <path>] [--user-dir <path>] [--json]
              检测 VS Code 配置文件是否存在、是否可解析。

          plan (--profile <path> | --preset <name>) [--workspace <path>] [--user-dir <path>] [--json]
              读取目标配置文件或内置 preset，输出拟变更计划，不落盘。

          apply (--profile <path> | --preset <name>) [--workspace <path>] [--user-dir <path>] [--json]
              按 profile 或内置 preset 写入配置文件；若目标文件已存在，会自动创建时间戳备份。

          validate [--profile <path> | --preset <name>] [--workspace <path>] [--user-dir <path>] [--json]
              不带 profile 时，仅校验目标文件可解析。
              带 profile/preset 时，额外校验目标文件是否满足期望配置。

          list-presets [--json]
              列出内置 preset。

          sample-profile [--preset <name>] [--output <path>]
              不带 --preset 时输出通用示例 profile；
              带 --preset 时输出指定内置 preset 的 profile 内容。

        Profile 结构：
          {
            "user": {
              "settings": { ... },
              "keybindings": [ ... ]
            },
            "workspace": {
              "settings": { ... },
              "extensions": {
                "recommendations": [ ... ],
                "unwantedRecommendations": [ ... ]
              }
            }
          }

        说明：
          - 用户级文件：
              %APPDATA%\Code\User\settings.json
              %APPDATA%\Code\User\keybindings.json
          - 工作区级文件：
              <workspace>\.vscode\settings.json
              <workspace>\.vscode\extensions.json
          - 可通过 --user-dir 指向临时用户目录，避免联调时修改真实 VS Code 用户配置。
          - 当前内置 preset 仅提供 Codex 相关模板。
          - 当前版本不实现 Codex / Open Code 的安装，只聚焦配置检测、编辑与校验。
        """;
}
