using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.Models;
using TaskManagerApi.Services;

namespace TaskManagerApi.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    
    public class TaskController : ControllerBase
    {
        private readonly TaskService _taskService;

        public TaskController(TaskService taskService)
        {
            _taskService = taskService;
        }

        //[HttpGet]
        //public async Task<ActionResult<List<TaskItem>>> Get() =>
        //    await _taskService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<TaskItem>> Get(string id)
        {
            var task = await _taskService.GetAsync(id);
            return task is null ? NotFound() : Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> Post(TaskItem task)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _taskService.CreateAsync(task);
            return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
        }

        [HttpPost("updateTask/{id:length(24)}")]
        public async Task<IActionResult> Put(string id, TaskItem updatedTask)
        {
            var existingTask = await _taskService.GetAsync(id);
            if (existingTask is null)
                return NotFound();

            updatedTask.Id = id;

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _taskService.UpdateAsync(id, updatedTask);
            return NoContent();
        }

        [HttpPost("deleteTask/{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var task = await _taskService.GetAsync(id);
            if (task is null)
                return NotFound();

            await _taskService.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> FilterTaskItems(
        [FromQuery] string? title,
        [FromQuery] string? description,
        [FromQuery] string? projectName,
        [FromQuery] Task_Status? status,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? teamMemberName,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortOrder,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromQuery] string? teamLeadId
        )
        {
            if(title==null &&description==null && projectName ==null && status==null && startDate==null && endDate==null &&teamMemberName==null && sortBy == null && sortOrder == null && page == null && pageSize == null)
                await _taskService.GetAsync();
            var result = await _taskService.FilterTask(title,description, projectName , status, startDate, endDate,teamMemberName,sortBy,sortOrder,page,pageSize,teamLeadId);
            return Ok(result);
        }
        [HttpGet("totaldata")]
        public async Task<IActionResult> GetDocumentSize()
        {
            var total = await _taskService.GetSize();
            return Ok(total);
        }


        [HttpPost("{taskId:length(24)}/comments")]
        public async Task<IActionResult> AddComment(string taskId, [FromBody] Comment comment)
        {
            var task = await _taskService.GetAsync(taskId);
            if (task is null) return NotFound();

            await _taskService.AddCommentAsync(taskId, comment);
            return Ok(comment);
        }

        [HttpGet("{taskId:length(24)}/comments")]
        public async Task<IActionResult> GetComments(string taskId)
        {
            var comments = await _taskService.GetCommentsAsync(taskId);
            return Ok(comments);
        }

        [HttpPost("{taskId:length(24)}/deleteComment/{commentId:length(24)}")]
        public async Task<IActionResult> DeleteComment(string taskId, string commentId)
        {
            await _taskService.DeleteCommentAsync(taskId, commentId);
            return NoContent();
        }

        [HttpPost("{taskId:length(24)}/editComment/{commentId:length(24)}")]
        public async Task<IActionResult> EditComment(string taskId, string commentId, string newText)
        {
            if (string.IsNullOrWhiteSpace(newText))
                return BadRequest("Comment text cannot be empty.");

            var updatedComment = await _taskService.EditCommentAsync(taskId, commentId, newText);

            if (updatedComment == null)
                return NotFound("Task or Comment not found.");

            return Ok(updatedComment); // Return updated comment
        }


        [HttpGet("Activity")]
        public async Task<IActionResult> GetTaskActivity(string taskId)
        {
           var activity= await _taskService.GetTaskActivity(taskId);
            Console.WriteLine($"Fetching activity for TaskId: {taskId}");

            return Ok(activity);
        }



    }
}
