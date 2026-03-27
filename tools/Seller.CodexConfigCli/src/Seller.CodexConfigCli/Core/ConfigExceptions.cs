namespace Seller.CodexConfigCli.Core;

public sealed class ConfigException(string message) : Exception(message);

public static class ExitCodes
{
    public const int Success = 0;
    public const int InvalidArguments = 2;
    public const int ValidationFailed = 3;
    public const int UnhandledError = 10;
}
