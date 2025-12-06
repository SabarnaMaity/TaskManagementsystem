using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.DTO
{
    public class TeamDTO
    {
       
        public string Name { get; set; } = null!;
        
        public string Email { get; set; } = null!;

        public string Password { get; set; } 
       
        public string Designation { get; set; }

        public string Role { get; set; } = "User";
    }
}
