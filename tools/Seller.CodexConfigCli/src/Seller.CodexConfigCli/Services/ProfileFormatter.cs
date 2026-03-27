using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using Seller.CodexConfigCli.Core;

namespace Seller.CodexConfigCli.Services;

public static class ProfileFormatter
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public static string Serialize(ProfileDocument document)
    {
        var root = new JsonObject();

        if (document.UserSettings is not null || document.UserKeybindings is not null)
        {
            var user = new JsonObject();
            if (document.UserSettings is not null)
            {
                user["settings"] = document.UserSettings.DeepClone();
            }

            if (document.UserKeybindings is not null)
            {
                user["keybindings"] = document.UserKeybindings.DeepClone();
            }

            root["user"] = user;
        }

        if (document.WorkspaceSettings is not null ||
            document.WorkspaceRecommendations is not null ||
            document.WorkspaceUnwantedRecommendations is not null)
        {
            var workspace = new JsonObject();

            if (document.WorkspaceSettings is not null)
            {
                workspace["settings"] = document.WorkspaceSettings.DeepClone();
            }

            if (document.WorkspaceRecommendations is not null || document.WorkspaceUnwantedRecommendations is not null)
            {
                var extensions = new JsonObject();
                if (document.WorkspaceRecommendations is not null)
                {
                    extensions["recommendations"] = document.WorkspaceRecommendations.DeepClone();
                }

                if (document.WorkspaceUnwantedRecommendations is not null)
                {
                    extensions["unwantedRecommendations"] = document.WorkspaceUnwantedRecommendations.DeepClone();
                }

                workspace["extensions"] = extensions;
            }

            root["workspace"] = workspace;
        }

        return root.ToJsonString(SerializerOptions);
    }
}
