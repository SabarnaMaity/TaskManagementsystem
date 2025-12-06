namespace TaskManagerApi.DTO
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public object User { get; set; } = default!;
    }
}
