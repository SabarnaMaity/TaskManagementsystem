using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace TaskManagerApi.Models
{
    public class TaskItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string Title { get; set; } = null!;
        [Required]
        public string Description { get; set; } = null!;
         public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }


        

        public List<TeamMember_IdName> TeamMember { get; set; } = new List<TeamMember_IdName>();
        public Project_IdName Project { get; set; } 

        public List<Comment> Comments { get; set; } = new();
      //  public List<Activity> Activities { get; set; } = new();

        [Required]
        //[BsonRepresentation(BsonType.String)]
        public Task_Status Status { get; set; } = Task_Status.ToDo;// To-Do, In-Progress, Done, Cancelled



    }
    public enum Task_Status
    {
        [EnumMember(Value = "ToDo")]
        ToDo,

        [EnumMember(Value = "InProgress")]
        InProgress,

        [EnumMember(Value = "Done")]
        Done,

        [EnumMember(Value = "Cancelled")]
        Cancelled
    }
    public class Project_IdName
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public string ProjectName { get; set; } = null!;

        public string? TeamLeadId { get; set; } = null!;
    }
    public class TeamMember_IdName
    {
        public string Id { get; set; } 
        public string Name { get; set; }

    }

    public class Comment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; } = ObjectId.GenerateNewId().ToString(); 
        public string Text { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [BsonIgnoreIfNull]
        public TeamMember_IdName? Author { get; set; } = new TeamMember_IdName();

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } = false;
    }



    

}
