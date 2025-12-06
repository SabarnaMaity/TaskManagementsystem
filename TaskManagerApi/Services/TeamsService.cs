using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text;
using TaskManagerApi.Models;

namespace TaskManagerApi.Services
{
    public class TeamsService
    {
        private readonly IMongoCollection<Team> _teamsCollection;
        private IConfiguration _configuration;
        public TeamsService(
            IOptions<TeamStoreDatabaseSettings> teamStoreDatabseSettings, IConfiguration configuration)
        {
            var mongoClient = new MongoClient(
                teamStoreDatabseSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(
                teamStoreDatabseSettings.Value.DatabaseName);
            _teamsCollection = mongoDatabase.GetCollection<Team>(
                teamStoreDatabseSettings.Value.TeamsCollectionName);
            _configuration= configuration;

        }


        public async Task<List<Team>> GetAsync()
        {
            var teamMembers= await _teamsCollection.Find(_ => true).ToListAsync();
             teamMembers.Reverse();
            return teamMembers;
        }
        public async Task<Team?> GetAsync(string id) =>
            await _teamsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
        public async Task<Team?> GetAsyncByEmail(string email) =>
            await _teamsCollection.Find(x => x.Email == email).FirstOrDefaultAsync();
        public async Task CreateAsync(Team newteam)
        {
            await _teamsCollection.InsertOneAsync(newteam);
        }

        public async Task UpdateAsync(string id, Team updatedTeam)
        {
            await _teamsCollection.ReplaceOneAsync(x => x.Id == id, updatedTeam);
        }

        public async Task RemoveAsync(string id) =>
            await _teamsCollection.DeleteOneAsync(x => x.Id == id);

        public async Task<long> GetSize()
        {
           return await _teamsCollection.CountDocumentsAsync(_ => true);
        }
        

        public async Task<List<Team>> FilterAndSortAsync(string? name,string?email, string? designation,string? sortBy, string? sortOrder,int page,int pageSize)
        {
            var filter = Builders<Team>.Filter.Empty;

            if (!string.IsNullOrEmpty(name))
            {
                var regex = new BsonRegularExpression(name, "i");
                var name_filter = Builders<Team>.Filter.Regex(x => x.Name,regex);
                var email_filter = Builders<Team>.Filter.Regex(x => x.Email, regex);
                var desig_filter = Builders<Team>.Filter.Regex(x => x.Designation, regex);
                filter &= Builders<Team>.Filter.Or(
                    name_filter,
                    email_filter,
                    desig_filter
                    );

            }

            //if (!string.IsNullOrEmpty(name))
            //{
            //    var name_filter = Builders<Team>.Filter.Regex(x => x.Name, new BsonRegularExpression(name, "i"));
            //    filter &=name_filter;
            //}
            //if (!string.IsNullOrEmpty(email))
            //{
            //    var email_filter = Builders<Team>.Filter.Regex(x => x.Email, new BsonRegularExpression(email, "i"));
            //    filter &= email_filter;
            //}

            //if (!string.IsNullOrEmpty(designation))
            //    filter &= Builders<Team>.Filter.Eq(t => t.Designation, designation);


            var query = _teamsCollection.Find(filter);

            // Default sort field
            
            //sortOrder = sortOrder?.ToLower() ?? "asc";

            switch (sortBy)
            {
                case "name":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Name) : query.SortBy(t => t.Name);
                    break;
                case "designation":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Designation) : query.SortBy(t => t.Designation);
                    break;
                case "email":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Email) : query.SortBy(t => t.Email);
                    break;
                //default:
                //    query = query.SortBy(t => t.Name); 
                //    break;
            }




            //if (sortOrder?.ToLower() == "desc")
            //    query = query.SortByDescending(t => t.Name);
            //else
            //    query = query.SortBy(t => t.Name); // Default is ascending

            // Apply pagination
            var skip = (page - 1) * pageSize;
            query = query.Skip(skip).Limit(pageSize);

            return await query.ToListAsync();

            //return await query.ToListAsync();
        }


        // Services/TeamsService.cs  (add this method)
        public async Task<Team?> GetByEmailAsync(string email) =>
            await _teamsCollection.Find(x => x.Email == email).FirstOrDefaultAsync();
        public  async Task<List<TeamMember>> GetTeamLeaders()
        {
           var teamLeaders=  await _teamsCollection.Find(x => x.Role == Roles.TeamLead).Project(x => new TeamMember
            {
                Id = x.Id,
                Name = x.Name
            }).ToListAsync();
            return teamLeaders;

        }
        public string GetAccessToken(Team userDetails)
        {
            var jwtSecurity = new JwtSecurityTokenHandler();
            var securityToken = jwtSecurity.CreateToken(new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                       // new Claim(ClaimTypes.Name, userDetails.UserId.ToString()),
                       
                        new Claim(ClaimTypes.Email, userDetails.Email),
                        new Claim(ClaimTypes.Role,userDetails.Role.ToString())
                    }),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(30),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])), SecurityAlgorithms.HmacSha256),
            });
            string accessToken = jwtSecurity.WriteToken(securityToken);
            return accessToken;
        }
    }


}
