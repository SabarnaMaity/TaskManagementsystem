using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Xml.Linq;
using TaskManagerApi.Models;

namespace TaskManagerApi.Services
{
    public class ProjectService
    {
        private readonly IMongoCollection<Project> _projectCollection;
        


        public ProjectService(IOptions<TeamStoreDatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(settings.Value.DatabaseName);
            //_projectCollection = mongoDatabase.GetCollection<Project>("Projects");
            _projectCollection = mongoDatabase.GetCollection<Project>(settings.Value.ProjectCollectionName);
            

        }


        //public async Task<List<Project>> GetAsync() =>
        //    await _projectCollection.Find(_ => true).ToListAsync();
        public async Task<List<Project>> GetAsync(string? TeamLeadId = null)
        {

            if (TeamLeadId is not null)
            {
                return await _projectCollection.Find((x) => x.TeamLead.Id == TeamLeadId).ToListAsync();
            }
            return await _projectCollection.Find(_ => true).ToListAsync();
        }


        //public async Task<List<BsonDocument>> LookupTeamsAsync()
        //{
        //    var pipeline = new List<BsonDocument>();
        //    {
        //        pipeline.Add(
        //            new BsonDocument("$lookup", new BsonDocument
        //            {
        //                { "from", "Teams" },
        //                { "localField", "TeamMembers" },
        //                { "foreignField", "_id" },
        //                { "as", "result" }
        //            })

        //        );

        //        var result = await _projectCollection.AggregateAsync<BsonDocument>(pipeline);
        //        return await result.ToListAsync();
        //    }
        //}

        //function for project lookup filter
        //public async Task<List<BsonDocument>> FilterAndLookupProjectsAsync(string? teamMember)
        //{
        //    var pipeline = new List<BsonDocument>();

        //    pipeline.Add(
        //        new BsonDocument("$lookup", new BsonDocument
        //        {
        //     { "from", "Teams" },
        //     { "localField", "TeamMembers" },
        //     { "foreignField", "_id" },
        //     { "as", "result" }
        //                })
        //            );

        //    var result = await _projectCollection.AggregateAsync<BsonDocument>(pipeline);
        //    return await result.ToListAsync();
        //}


        //    public async Task<List<BsonDocument>> FilterAndLookupProjectsAsyncc(string? teamMember)
        //    {
        //        var pipeline = new List<BsonDocument>();

        //        // $lookup stage
        //        pipeline.Add(new BsonDocument("$lookup", new BsonDocument
        //{
        //    { "from", "Teams" },
        //    { "localField", "TeamMembers" },
        //    { "foreignField", "_id" },
        //    { "as", "result" }
        //}));

        //        // Only apply $match if a filter value is provided
        //        if (!string.IsNullOrEmpty(teamMember))
        //        {
        //            var objectId = ObjectId.Parse(teamMember); // Ensure it's parsed to ObjectId

        //            // Match projects where result._id (from lookup) contains the specified team member
        //            pipeline.Add(new BsonDocument("$match", new BsonDocument
        //    {
        //        { "result._id", objectId }
        //    }));
        //        }

        //        var result = await _projectCollection.AggregateAsync<BsonDocument>(pipeline);
        //        return await result.ToListAsync();
        //    }


        // 2. $lookup stage(2nd approach)/$lookup stage(2nd approach)

        //    public async Task<List<BsonDocument>> FilterTeams(string? teamMember)
        //    {
        //        var pipeline = new List<BsonDocument>();

        //        // 1. $lookup stage(2nd approach)
        //        pipeline.Add(new BsonDocument("$lookup", new BsonDocument
        //{
        //    { "from", "Teams" },
        //    { "localField", "TeamMembers" },
        //    { "foreignField", "_id" },
        //    { "as", "result" }
        //}));

        //        // 2. $match by teamMember ID (if given)
        //        if (!string.IsNullOrEmpty(teamMember))
        //        {
        //            var objectId = ObjectId.Parse(teamMember);

        //            pipeline.Add(new BsonDocument("$match", new BsonDocument
        //    {
        //        { "result._id", objectId }
        //    }));
        //        }

        //        // 3. $project to return only Project Name and Team Member Names
        //        pipeline.Add(new BsonDocument("$project", new BsonDocument
        //{
        //    { "ProjectName", "$ProjectName" }, // Rename Project.Name to ProjectName
        //    { "TeamMembers", new BsonDocument("$map", new BsonDocument
        //        {
        //            { "input", "$result" },
        //            { "as", "member" },
        //            { "in", "$$member.Name" }
        //        })
        //    },
        //    { "_id", 0 } // Exclude _id if not needed
        //}));

        //        var result = await _projectCollection.AggregateAsync<BsonDocument>(pipeline);
        //        return await result.ToListAsync();
        //    }


        public async Task<long> GetSize()
        {
            return await _projectCollection.CountDocumentsAsync(_ => true);
        }

        public async Task<Project?> GetAsyncById(string id) =>
            await _projectCollection.Find(p => p.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Project newProject) =>
            await _projectCollection.InsertOneAsync(newProject);

        public async Task UpdateAsync(string id, Project updatedProject) =>
            await _projectCollection.ReplaceOneAsync(p => p.Id == id, updatedProject);

        public async Task DeleteAsync(string id) =>
            await _projectCollection.DeleteOneAsync(p => p.Id == id);


        //edited 5sep
        public async Task<List<TeamMember>> GetTeamMembers(string projectId)
        {
            var project = await _projectCollection
                .Find(p => p.Id == projectId)
                .FirstOrDefaultAsync();

            if (project == null)
            {
                return new List<TeamMember>();
            }

            // Return only Id + Name (already stored in Project)
            return project.TeamMember
                .Select(m => new TeamMember
                {
                    Id = m.Id,
                    Name = m.Name
                })
                .ToList();
        }


        public async Task<List<Project>> FilterAndSortAsync(string? name ,
            string? sortBy, string? sortOrder, int page , int pageSize, string? TeamId = null)
        {
            var filter = Builders<Project>.Filter.Empty;

            if (!string.IsNullOrEmpty(name))
            {
                filter &= Builders<Project>.Filter.Or(
                        Builders<Project>.Filter.Regex(
                            x=>x.ProjectName,
                            new BsonRegularExpression(name,"i")),
                            Builders<Project>.Filter.ElemMatch(
                                x=>x.TeamMember,
                                Builders<TeamMember>.Filter.Regex(
                                    m=>m.Name,
                                    new BsonRegularExpression(name,"i"))
                            )


                );
                //var project_filter = Builders<Project>.Filter.Regex(x => x.ProjectName, new BsonRegularExpression(name, "i"));
                //filter &= project_filter;
            }
            //if (!string.IsNullOrEmpty(TeamMemberName))
            //{
            //    filter &= Builders<Project>.Filter.ElemMatch(
            //        x => x.TeamMember,
            //        m=>m.Name.Contains(TeamMemberName)

            //    );
            //}




            // Check if TeamId belongs to either TeamLead OR TeamMember
            if (!string.IsNullOrEmpty(TeamId))
            {
                var teamLeadFilter = Builders<Project>.Filter.Eq(p => p.TeamLead.Id, TeamId);
                var teamMemberFilter = Builders<Project>.Filter.ElemMatch(
                    p => p.TeamMember,
                    Builders<TeamMember>.Filter.Eq(m => m.Id, TeamId)
                );

                filter &= Builders<Project>.Filter.Or(teamLeadFilter, teamMemberFilter);
            }

            //if (!string.IsNullOrEmpty(TeamMemberName))
            //{
            //    filter &= Builders<Project>.Filter.ElemMatch(
            //        x => x.TeamMember,
            //        Builders<TeamMember>.Filter.Regex(
            //           m => m.Name,
            //        new BsonRegularExpression(TeamMemberName, "i") // "i" = case-insensitive
            //        )
            //    );
            //}

            //if (!string.IsNullOrEmpty(TeamleadId))
            //    filter &= Builders<Project>.Filter.Eq(p => p.TeamLead.Id, TeamleadId);
            //if (teamMember!=null)
            //    filter &= Builders<Project>.Filter.Eq(t => t.TeamMember, teamMember);
            var query = _projectCollection.Find(filter);

            // Default sort field

            sortOrder = sortOrder?.ToLower() ?? "asc";
            switch (sortBy)
            {
                case "name":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.ProjectName) : query.SortBy(t => t.ProjectName);
                    break;
                case "description":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Description) : query.SortBy(t => t.Description);
                    break;
                //case "TeamMemberName":
                //    query = sortOrder == "desc" ? query.SortByDescending(t => t.TeamMember) : query.SortBy(t => t.TeamMember);
                //    break;

                case "TeamMemberName":
                    query = sortOrder == "desc"
                        ? query.SortByDescending(t => t.TeamMember.First().Name)
                        : query.SortBy(t => t.TeamMember.First().Name);
                    break;
                

                default:
                    query = query.SortBy(t => t.ProjectName);
                    break;
            }


           
            // Apply pagination
            var skip = (page - 1) * pageSize;
            query = query.Skip(skip).Limit(pageSize);

            //if (sortOrder?.ToLower() == "desc")
            //    query = query.SortByDescending(t => t.Name);
            //else
            //    query = query.SortBy(t => t.Name); // Default is ascending

            return await query.ToListAsync();
        }
    }
}
