using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Models
{
    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; } 

        [Required(ErrorMessage = "Project name is required")]
        public string ProjectName { get; set; } = null!;   

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = null!;

       

        public List<TeamMember> TeamMember { get; set; } = new List<TeamMember>();
        [Required]
        public TeamMember TeamLead { get; set; } //edit

    }
    public class TeamMember
    {
        public string Id { get; set; }
        public string Name { get; set; }

    }
    
}
