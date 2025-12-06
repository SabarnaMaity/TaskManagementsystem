using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.Models;
using TaskManagerApi.Services;

namespace TaskManagerApi.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class TeamsController : ControllerBase
    {
        private readonly TeamsService _teamsService;
        public TeamsController(TeamsService teamsService) =>
            _teamsService = teamsService;

        //[HttpGet]
        //public async Task<List<Team>> Get() =>
        //    await _teamsService.GetAsync();




        //edited section


        //[HttpGet("filter")]
        //public async Task<IActionResult> GetFilteredTeams([FromQuery] TeamsQueryParameter query)
        //{
        //    var teams = await _teamsService.GetFilteredTeamsAsync(query);
        //    return Ok(teams);
        //}








        [Authorize(Roles = "Admin,User,TeamLead")]
        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Team>> Get(string id)
        {
            var team = await _teamsService.GetAsync(id);

            if (team is null)
            {
                return NotFound();
            }

            return team;
        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post(Team newTeam)
        {
            newTeam.Password = "Welcome";//welcome is default password
            newTeam.Password = BCrypt.Net.BCrypt.HashPassword(newTeam.Password);
            await _teamsService.CreateAsync(newTeam);
            return CreatedAtAction(nameof(Get), new { id = newTeam.Id }, newTeam);

        }
        [Authorize(Roles = "Admin")]
        [HttpPost("update/{id:length(24)}")]
        public async Task<IActionResult> Update(string id, Team updatedTeam)
        {
            var team = await _teamsService.GetAsync(id);

            if (team is null)
            {
                return NotFound();
            }

            updatedTeam.Id = team.Id;
            updatedTeam.Password=BCrypt.Net.BCrypt.HashPassword(updatedTeam.Password);
            await _teamsService.UpdateAsync(id, updatedTeam);

            return NoContent();
        }
        [Authorize(Roles = "Admin")]
        [HttpPost("delete/{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var team = await _teamsService.GetAsync(id);
            if (team is null)
            {
                return NotFound();
            }
            await _teamsService.RemoveAsync(id);
            return NoContent();
        }
        //[HttpGet("{name}")]
        //public async Task<List<Team>> searchName(string name) {
        //    return await _teamsService.searchByName(name);


        //}


        [Authorize(Roles = "Admin,User,TeamLead")]
        [HttpGet]
        public async Task<IActionResult> FilterAndSortTeams(string? name,string?email, string? designation, string? sortBy, string? sortOrder, int page , int pageSize)
        {
            if(name == null &&email==null && designation== null && sortBy==null && sortOrder == null &&page==null && pageSize==null)
            {
                var team = await _teamsService.GetAsync();
                return Ok(team);
            }
            var result = await _teamsService.FilterAndSortAsync(name,email, designation,sortBy, sortOrder, page, pageSize);
            return Ok(result);
        }

        [HttpGet("TeamLeaders")]
        [Authorize(Roles="Admin,TeamLead")]
        public async Task<List<TeamMember>> GetTeamLead()
        {
            return await _teamsService.GetTeamLeaders();
        }


        [HttpGet("totaldata")]
        public async Task<IActionResult> GetDocumentSize()
        {
            var total = await _teamsService.GetSize();
            return Ok(total);
        }


    }
}
