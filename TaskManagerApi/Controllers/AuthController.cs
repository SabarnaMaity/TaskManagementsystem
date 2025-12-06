using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.DTO;
using TaskManagerApi.Models;
using TaskManagerApi.Services;

namespace TaskManagerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TeamsService _teamsService;


        public AuthController(TeamsService teamsService)
        {
            _teamsService = teamsService;

        }
        [HttpPost("Register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Register([FromBody] Team team)
        {
            // basic checks
            if (string.IsNullOrWhiteSpace(team.Email) || string.IsNullOrWhiteSpace(team.Password))
                return BadRequest("Email and Password are required.");

            // prevent duplicates
            var existing = await _teamsService.GetAsyncByEmail(team.Email);
            if (existing is not null)
                return BadRequest("Email already registered.");

            var user = new Team
            {
                Name = team.Name,
                Email = team.Email.Trim().ToLower(),
                Designation = team.Designation,
                Role = team.Role,
                Password = BCrypt.Net.BCrypt.HashPassword(team.Password) // hash

            };

            await _teamsService.CreateAsync(user);

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role

            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(string email, string password)
        {
            // basic checks
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                return BadRequest("Email and Password are required for login.");

            // prevent duplicates
            var existing = await _teamsService.GetAsyncByEmail(email);

            if (existing is null)
                return NotFound("Invalid email id");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, existing.Password);
            if (isPasswordValid)
            {
                return Ok(new
                {
                    token = _teamsService.GetAccessToken(existing),
                    user = new
                    {
                        existing.Id,
                        existing.Name,
                        existing.Email,
                        existing.Role
                    }
                });
            }
            return NotFound("please provide correct details . ");
        }

    }
}
