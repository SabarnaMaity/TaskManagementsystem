
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManagerApi.Models
{
    public class Team
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [Required]
        public string Name { get; set; } = null!;
        [EmailAddress]
        public string Email { get; set; } = null!;
        // [Required]
        // public bool IsActive { get; set; }= true;
        
        public string? Password { get; set; } = string.Empty;
        [Required]
        public string Designation { get; set; } = null!;
        [Required]
        public Roles Role { get; set; } = Roles.User;
    }
    public enum Roles
    {
        Admin,
        TeamLead,
        User

    }
}
