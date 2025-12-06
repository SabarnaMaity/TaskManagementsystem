export interface TaskInterface{
    Id:string,
    Title:string,
    Description:string,
    StartDate:string,
    EndDate:string,
    TeamMember:Team_Member[],
    Project:Project_Detail,
    Status:Task_Status[]
}
export interface Team_Member{
    Id:string,
    Name:string
}
export interface Project_Detail{
    Id:string,
    ProjectName:string,
    TeamLead: { Id: string; Name: string };
}
export interface Task_Status{
    ToDo:string,
    InProgress:string;
    Done:string;
    Cancelled:string;
}
// Separate comment interface
export interface CommentInterface {
  Id: string;
  Text: string;
  CreatedAt: string;
  Author: {
    Id: string;
    Name: string;
  };
  IsDeleted: boolean;
}