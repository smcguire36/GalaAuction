using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Routing;

namespace GalaAuction.Server.Mappings
{
    public class KebabCaseParameterTransformer : IOutboundParameterTransformer
    {
        public string? TransformOutbound(object? value)
        {
            if (value == null) return null;

            // Uses Regex to find uppercase letters and insert a hyphen
            return Regex.Replace(value.ToString()!, "([a-z])([A-Z])", "$1-$2").ToLowerInvariant();
        }
    }
}
