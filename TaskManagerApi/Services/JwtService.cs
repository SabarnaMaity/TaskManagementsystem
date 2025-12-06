//using Microsoft.IdentityModel.Tokens;
//using System.IdentityModel.Tokens.Jwt;
//using System.Security.Claims;
//using System.Text;
//using TaskManagerApi.Models;

//namespace TaskManagerApi.Services
//{
//    public class JwtService
//    {
//        private readonly IConfiguration _config;

//        public JwtService(IConfiguration config)
//        {
//            _config = config;
//        }

//        public string GenerateToken(Team user, int expireMinutes = 60)
//        {
//            var issuer = _config["Jwt:Issuer"];
//            var audience = _config["Jwt:Audience"];
//            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

//            var claims = new List<Claim>
//            {
//                new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
//                new Claim(JwtRegisteredClaimNames.Email, user.Email),
//                new Claim(JwtRegisteredClaimNames.UniqueName, user.Name),
//                new Claim("designation", user.Designation),
//                new Claim(ClaimTypes.Role,user.Role),
//                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
//            };

//            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
//            var token = new JwtSecurityToken(
//                issuer: issuer,
//                audience: audience,
//                claims: claims,
//                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
//                signingCredentials: creds
//            );

//            return new JwtSecurityTokenHandler().WriteToken(token);
//        }
//    }
//}
