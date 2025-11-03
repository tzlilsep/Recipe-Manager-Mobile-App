// MyApp\Backend\TS.Api\Infrastructure\BearerTokenReader.cs
using Microsoft.Net.Http.Headers;

namespace TS.Api.Infrastructure
{
    public static class BearerTokenReader
    {
        public static string? Read(HttpRequest request)
        {
            if (!request.Headers.TryGetValue(HeaderNames.Authorization, out var values))
                return null;

            var raw = values.ToString();
            if (string.IsNullOrWhiteSpace(raw)) return null;

            const string prefix = "Bearer ";
            if (raw.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                return raw.Substring(prefix.Length).Trim();

            return raw.Trim();
        }
    }
}
