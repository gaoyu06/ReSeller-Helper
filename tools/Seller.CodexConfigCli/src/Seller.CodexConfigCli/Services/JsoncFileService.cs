using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public sealed class JsoncFileService
{
    private readonly JsonSerializerOptions _serializerOptions = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public (JsonNode Node, bool Exists) LoadOrCreateDefault(string path, JsonValueKind rootKind)
    {
        if (!File.Exists(path))
        {
            return (CreateDefault(rootKind), false);
        }

        var text = File.ReadAllText(path);

        try
        {
            var node = JsonNode.Parse(
                text,
                documentOptions: new JsonDocumentOptions
                {
                    CommentHandling = JsonCommentHandling.Skip,
                    AllowTrailingCommas = true,
                }) ?? throw new ConfigException($"文件 {path} 为空。");

            if (GetRootKind(node) != rootKind)
            {
                throw new ConfigException($"文件 {path} 的根节点类型不正确，期望 {rootKind}。");
            }

            return (node, true);
        }
        catch (JsonException ex)
        {
            throw new ConfigException($"文件 {path} 不是合法的 JSON/JSONC：{ex.Message}");
        }
    }

    public FileInspection Inspect(string path, FileKind kind, JsonValueKind rootKind)
    {
        if (!File.Exists(path))
        {
            return new FileInspection(kind, path, false, true, "文件不存在，可按需创建。");
        }

        try
        {
            _ = LoadOrCreateDefault(path, rootKind);
            return new FileInspection(kind, path, true, true, "文件可解析。");
        }
        catch (ConfigException ex)
        {
            return new FileInspection(kind, path, true, false, ex.Message);
        }
    }

    public async Task<string?> WriteAsync(string path, JsonNode content)
    {
        var fullPath = Path.GetFullPath(path);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        string? backupPath = null;
        if (File.Exists(fullPath))
        {
            backupPath = $"{fullPath}.bak.{DateTimeOffset.Now:yyyyMMddHHmmssfff}";
            File.Copy(fullPath, backupPath, overwrite: false);
        }

        var tempFilePath = $"{fullPath}.tmp";
        await File.WriteAllTextAsync(tempFilePath, content.ToJsonString(_serializerOptions));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        File.Move(tempFilePath, fullPath);
        return backupPath;
    }

    public static JsonObject CloneObject(JsonObject value) => (JsonObject)value.DeepClone();

    public static JsonArray CloneArray(JsonArray value) => (JsonArray)value.DeepClone();

    private static JsonNode CreateDefault(JsonValueKind rootKind) => rootKind switch
    {
        JsonValueKind.Object => new JsonObject(),
        JsonValueKind.Array => new JsonArray(),
        _ => throw new InvalidOperationException($"Unsupported root kind: {rootKind}"),
    };

    private static JsonValueKind GetRootKind(JsonNode node) => node switch
    {
        JsonObject => JsonValueKind.Object,
        JsonArray => JsonValueKind.Array,
        JsonValue => JsonValueKind.String,
        _ => JsonValueKind.Undefined,
    };
}
