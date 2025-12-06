namespace TaskManagerApi.DTO
{
    public class User
    {
        public string Id { get; set; }= string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string Role { get; set; } = "User";

        public bool IsActive { get; set; } = true;

        public string Token {  get; set; } = string.Empty;
       
    }
}
