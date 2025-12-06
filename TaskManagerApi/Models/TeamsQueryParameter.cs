namespace TaskManagerApi.Models
{
    public class TeamsQueryParameter
    {
        public string? Name { get; set; }
        public string? Designation { get; set; }
        public string? SortBy { get; set; } = "Name";
        public bool IsDescending { get; set; } = false;
        //public int Page { get; set; } = 1;
        //public int PageSize { get; set; } = 10;
    }
}
