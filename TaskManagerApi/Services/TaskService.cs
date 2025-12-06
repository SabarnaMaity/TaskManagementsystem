using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Globalization;
using System.Reflection;
using System.Threading.Tasks;
using System.Xml.Linq;
using TaskManagerApi.DTO;
using TaskManagerApi.Models;

namespace TaskManagerApi.Services
{
    public class TaskService
    {
        private readonly IMongoCollection<TaskItem> _taskCollection;
        private readonly IMongoCollection<Activity> _activityCollection;
        private readonly IMongoCollection<Project> _projectCollection;

        public TaskService(IOptions<TeamStoreDatabaseSettings> dbSettings)
        {
            var mongoClient = new MongoClient(dbSettings.Value.ConnectionString);
            var mongoDatabase = mongoClient.GetDatabase(dbSettings.Value.DatabaseName);
            _taskCollection = mongoDatabase.GetCollection<TaskItem>(dbSettings.Value.TaskCollectionName);
            _activityCollection = mongoDatabase.GetCollection<Activity>(dbSettings.Value.ActivityCollectionName);
            _projectCollection = mongoDatabase.GetCollection<Project>(dbSettings.Value.ProjectCollectionName);

        }

        public async Task<List<TaskItem>> GetAsync() =>
            await _taskCollection.Find(_ => true).ToListAsync();
        public async Task<long> GetSize()
        {
            return await _taskCollection.CountDocumentsAsync(_ => true);
        }
        public async Task<TaskItem?> GetAsync(string id) =>
            await _taskCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(TaskItem task)
        {
            await _taskCollection.InsertOneAsync(task);
            await LogActivity(task.Id, "Task added");
        }
           


        //public async Task UpdateAsync(string id, TaskItem updatedTask)
        //{
        //    await _taskCollection.ReplaceOneAsync(x => x.Id == id, updatedTask);
        //    await LogActivity(updatedTask.Id, "Task Updated");
        //}


        public async Task UpdateAsync(string id, TaskItem updatedTask)
        {
            var existingTask = await _taskCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
            if (existingTask == null) return;

            // Compare fields manually
            if (existingTask.Title != updatedTask.Title)
                await LogActivity(id, $"Title changed from '{existingTask.Title}' to '{updatedTask.Title}'");

            if (existingTask.Description != updatedTask.Description)
                await LogActivity(id, $"Description changed");

            if (existingTask.Status != updatedTask.Status)
                await LogActivity(id, $"Status changed from {existingTask.Status} to {updatedTask.Status}");
            if (existingTask.StartDate != updatedTask.StartDate)
                await LogActivity(id, $"StartDtae changed from {existingTask.StartDate} to {updatedTask.StartDate}");

            if (existingTask.EndDate != updatedTask.EndDate)
                await LogActivity(id, $"EndDate changed from {existingTask.EndDate} to {updatedTask.EndDate}");
            // Save updated document
            await _taskCollection.ReplaceOneAsync(x => x.Id == id, updatedTask);
        }



        public async Task DeleteAsync(string id)
        {
            await _taskCollection.DeleteOneAsync(x => x.Id == id);
            await LogActivity(id, "task deleted");
        }
            


        public async Task<List<TaskItem>> FilterTask(string? title,string? description,string? projectName,Task_Status? status, DateTime? startDate, DateTime? endDate, string? teamMemberName,string? sortBy,string? sortOrder, int page, int pageSize,string? TeamId)
        {
            var filter = Builders<TaskItem>.Filter.Empty;

            //if (!string.IsNullOrEmpty(title))
            //{
            //    var title_filter = Builders<TaskItem>.Filter.Regex(t => t.Title, new BsonRegularExpression(title, "i"));
            //    filter &= title_filter;
            //}
            //if (!string.IsNullOrEmpty(teamMemberName))
            //{
            //    filter &= Builders<TaskItem>.Filter.ElemMatch(
            //        x => x.TeamMember,
            //        Builders<TeamMember_IdName>.Filter.Regex(
            //           m => m.Name,
            //        new BsonRegularExpression(teamMemberName, "i") // "i" = case-insensitive
            //        )
            //    );
            //}


            if(!string.IsNullOrEmpty(TeamId))
            {
                // Find all projects where user is a team lead OR member
                var projectFilter = Builders<Project>.Filter.Or(
                    Builders<Project>.Filter.Eq(p => p.TeamLead.Id, TeamId),
                    Builders<Project>.Filter.ElemMatch(
                p => p.TeamMember,
                        Builders<TeamMember>.Filter.Eq(m => m.Id, TeamId)
                    )
                );

                var userProjects = await _projectCollection.Find(projectFilter).ToListAsync();
                var projectIds = userProjects.Select(p => p.Id).ToList();

                if (!projectIds.Any())
                    return new List<TaskItem>();

                // Now fetch all tasks for those projects
                var taskFilter = Builders<TaskItem>.Filter.In(t => t.Project.Id, projectIds);

                filter &= taskFilter;
            }
            // return await _tasks.Find(taskFilter).ToListAsync();

            if (!string.IsNullOrEmpty(title))
            {
                var regex = new BsonRegularExpression(title, "i");
                var title_filter = Builders<TaskItem>.Filter.Regex(t => t.Title, regex);
                var description_filter = Builders<TaskItem>.Filter.Regex(t => t.Description, regex);
                
                var member_filter = Builders<TaskItem>.Filter.ElemMatch(
                    x => x.TeamMember,
                    Builders<TeamMember_IdName>.Filter.Regex(
                        m => m.Name, regex)
                 );
                var projectname_filter = Builders<TaskItem>.Filter.Regex(m => m.Project.ProjectName, regex);

                filter &= Builders<TaskItem>.Filter.Or(
                        title_filter,
                        description_filter,
                        member_filter,
                        projectname_filter
                    );

            }


            
           
            if (status.HasValue)
                filter &= Builders<TaskItem>.Filter.Eq(t => t.Status, status.Value);
            if (startDate.HasValue)
                filter &= Builders<TaskItem>.Filter.Gte(t => t.StartDate, startDate.Value);

            if (endDate.HasValue)
                filter &= Builders<TaskItem>.Filter.Lt(t => t.EndDate, endDate.Value);
           // if (TeamId is not null)
             //   filter &= Builders<TaskItem>.Filter.Eq(t => t.Project.TeamLeadId, TeamId);

            var query =_taskCollection.Find(filter);
            //var query = _projectCollection.Find(filter);

            // Default sort field

            //sortOrder = sortOrder?.ToLower() ?? "asc";
            switch (sortBy)
            {
                case "title":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Title) : query.SortBy(t => t.Title);
                    break;
                case "description":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Description) : query.SortBy(t => t.Description);
                    break;
                case "startDate":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.StartDate) : query.SortBy(t => t.StartDate);
                    break;
                case "endDate":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.EndDate) : query.SortBy(t => t.EndDate);
                    break;
                case "status":
                    query = sortOrder == "desc" ? query.SortByDescending(t => t.Status) : query.SortBy(t => t.Status);
                    break;
                case "teamMemberName":
                    query = sortOrder == "desc"
                        ? query.SortByDescending(t => t.TeamMember.First().Name)
                        : query.SortBy(t => t.TeamMember.First().Name);
                    break;

                case "projectName":
                    query = sortOrder == "desc"
                        ? query.SortByDescending(t => t.Project.ProjectName)
                        : query.SortBy(t => t.Project.ProjectName);
                    break;
                    //default:
                    //    query = query.SortBy(t => t.Title);
                    //    break;
            }

            // Apply pagination
            var skip = (page - 1) * pageSize;
                query = query.Skip(skip).Limit(pageSize);

            return await query.ToListAsync();
        }

        
        public async Task AddCommentAsync(string taskId, Comment comment)
        {
            var objectId = new ObjectId(taskId); // convert string to ObjectId
            var addComment = Builders<TaskItem>.Update.Push(t => t.Comments, comment);
            await _taskCollection.UpdateOneAsync(t => t.Id == objectId.ToString(), addComment);

        }
        public async Task<List<Comment>> GetCommentsAsync(string taskId)
        {
            var objectId = new ObjectId(taskId);
            var task = await _taskCollection.Find(t => t.Id == objectId.ToString()).FirstOrDefaultAsync();
            return task?.Comments ?? new List<Comment>();
        }

        public async Task LogActivity(string taskId,string action )
        {
            var log = new Activity
            {
                TaskId = taskId,
                Action = action,
                CreatedAt = DateTime.UtcNow
            };

            await _activityCollection.InsertOneAsync(log);
        }
        public async Task<List<Activity>> GetTaskActivity(string taskId)
        {
            var res = await _activityCollection.Find(x => x.TaskId == taskId)
                                                .SortByDescending(x => x.CreatedAt)
                                                .ToListAsync();

            return res;
        }


        public async Task DeleteCommentAsync(string taskId, string commentId)
        {
            var comment = Builders<TaskItem>.Update.PullFilter(
                t => t.Comments,
                c => c.Id == commentId
            );

            await _taskCollection.UpdateOneAsync(t => t.Id == taskId, comment);
        }

        public async Task<Comment?> EditCommentAsync(string taskId, string commentId, string newText)
        {
            // Step 1: Find the task
            var task = await _taskCollection.Find(t => t.Id == taskId).FirstOrDefaultAsync();
            if (task == null) return null;

            // Step 2: Find the comment
            var comment = task.Comments.FirstOrDefault(c => c.Id == commentId && !c.IsDeleted);
            if (comment == null) return null;

            // Step 3: Update fields
            comment.Text = newText;
            comment.CreatedAt = DateTime.UtcNow;

            // Step 4: Save back to DB
            var filter = Builders<TaskItem>.Filter.Eq(t => t.Id, taskId);
            var update = Builders<TaskItem>.Update.Set(t => t.Comments, task.Comments);

            var result = await _taskCollection.UpdateOneAsync(filter, update);

            return result.ModifiedCount > 0 ? comment : null;
        }


    }
}
