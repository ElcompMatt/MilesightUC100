public static class UnixTimeConverter
{
    public static string ToIsoString(long? unixSeconds)
    {
        if (!unixSeconds.HasValue) return string.Empty;

        // Converts seconds to a DateTimeOffset, then returns ISO 8601 format
        return DateTimeOffset.FromUnixTimeSeconds(unixSeconds.Value).UtcDateTime.ToString("o");
    }
}