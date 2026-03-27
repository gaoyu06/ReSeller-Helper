# Seller.CodexConfigCli

Windows 下的 Codex / VS Code 配置工具。

## 结构

- `Seller.sln`：解决方案入口
- `src/Seller.CodexConfigCli`：CLI 主项目
- `tests/Seller.CodexConfigCli.Tests`：测试项目
- `sample-profile.json`：示例 profile

## 常用命令

```powershell
dotnet build .\Seller.sln
dotnet test .\Seller.sln --no-build

dotnet run --project .\src\Seller.CodexConfigCli -- detect
dotnet run --project .\src\Seller.CodexConfigCli -- list-presets
dotnet run --project .\src\Seller.CodexConfigCli -- sample-profile --output .\sample-profile.json
```
