using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TaskManagerApi.Models
{
    public class Activity
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; } 
        public string TaskId { get; set; }
        public string Action { get; set; } = null!;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
       
    }

}
