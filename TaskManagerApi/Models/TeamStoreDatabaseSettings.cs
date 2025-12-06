namespace TaskManagerApi.Models
{
    public class TeamStoreDatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; }= null!;
        
        public string TeamsCollectionName { get; set; } = null!;

        public string ProjectCollectionName {  get; set; } = null!;

        public string TaskCollectionName { get; set; } = null!;

        public string ActivityCollectionName {  get; set; } = null!;
    }
}
