using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using TaskManagerApi.Models;
using TaskManagerApi.Services;

namespace TaskManagerApi.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {


        private readonly ProjectService _projectService;

        public ProjectsController(ProjectService projectService)
        {
            _projectService = projectService;
        }

        //[HttpGet]
        //public async Task<ActionResult<List<Project>>> Get() =>
        //    await _projectService.GetAsync();

        //[HttpGet("withteams")]
        //public async Task<ActionResult> FindByTeamMember(string? teamMember)
        //{
        //    var result = await _projectService.FilterTeams(teamMember);
        //    return Content(result.ToJson(), "application/json");
        //    //return Ok(result.ToJson(),"application/json");
        //}


        [HttpGet("{id:length(24)}")]
        [Authorize(Roles = "Admin,TeamLead")]
        public async Task<ActionResult<Project>> Get(string id)
        {
            var project = await _projectService.GetAsyncById(id);
            if (project is null) return NotFound();
            return project;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post(Project newProject)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _projectService.CreateAsync(newProject);
            return CreatedAtAction(nameof(Get), new { id = newProject.Id }, newProject);
        }

        [HttpPost("update/{id:length(24)}")]
        [Authorize(Roles = "Admin,TeamLead")]
        public async Task<IActionResult> Put(string id, Project updatedProject)
        {
            var project = await _projectService.GetAsyncById(id);
            if (project is null) return NotFound();

            updatedProject.Id = project.Id;
            await _projectService.UpdateAsync(id, updatedProject);
            return Ok("Project updated");
        }

        [HttpPost("delete/{id:length(24)}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var project = await _projectService.GetAsync(id);
            if (project is null) return NotFound();

            await _projectService.DeleteAsync(id);
            return Ok("Project deleted");
        }


        //[HttpGet]
        //[Authorize(Roles = "Admin,TeamLead,User")]
        //public async Task<IActionResult> FilterAndSortTeams(
        // string? name,string? description, string? TeamMemberName, string? sortBy, string? sortOrder, int page,int pageSize,string? TeamId)
        //{
        //    if(name==null && description==null && TeamMemberName == null && page==null && pageSize==null && sortBy == null && sortOrder == null )
        //    {
        //        if (!string.IsNullOrEmpty(TeamId))
        //        {
        //            // fetch only projects for that TeamLead
        //            return Ok(await _projectService.GetAsyncById(TeamId));
        //        }
        //        else
        //        {
        //            // fetch all projects
        //            return Ok(await _projectService.GetAsync(null));
        //        }
        //        //await _projectService.GetAsync();
        //    }

        //    var result = await _projectService.FilterAndSortAsync(name ,description, TeamMemberName, sortBy,sortOrder, page, pageSize,TeamId);
        //    return Ok(result);
        //}



        ////edited 5sep
        //[HttpGet("{projectId}/TeamMembers")]
        //[Authorize(Roles="Admin,TeamLead, User")]
        //public async Task<ActionResult<List<TeamMember>>> GetProjectMember(string? projectId)
        //{
        //    if (string.IsNullOrEmpty(projectId))
        //    {
        //        return BadRequest("project id is required");
        //    }
        //    var members = await _projectService.GetTeamMembers(projectId);
        //    if(members==null|| members.Count == 0)
        //    {
        //        return NotFound("members not found");
        //    }
        //    return Ok(members);


        //}
        ////edited today


        [HttpGet]
        [Authorize(Roles = "Admin,TeamLead,User")]
        public async Task<IActionResult> FilterAndSortProjects(
               string? name,
               string? sortBy,
               string? sortOrder,
               int page,
               int pageSize,
               string? TeamId)
        {
            if (string.IsNullOrEmpty(name) &&
                string.IsNullOrEmpty(sortBy) &&
                string.IsNullOrEmpty(sortOrder))
            {
                if (!string.IsNullOrEmpty(TeamId))
                {
                    // Fetch projects where this Id is either a TeamLead OR a TeamMember
                    return Ok(await _projectService.FilterAndSortAsync(null, null, null, page, pageSize, TeamId));
                }
                else
                {
                    // Fetch all projects
                    return Ok(await _projectService.GetAsync(null));
                }
            }

            var result = await _projectService.FilterAndSortAsync(
                name,
                sortBy,
                sortOrder,
                page,
                pageSize,
                TeamId
            );

            return Ok(result);
        }


        [HttpGet("totaldata")]
        [Authorize(Roles = "Admin,TeamLead")]
        public async Task<IActionResult> GetDocumentSize()
        {
            var total = await _projectService.GetSize();
            return Ok(total);
        }
    }
}
