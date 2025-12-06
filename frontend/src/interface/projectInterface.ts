export interface TeamMember {
  Id: string;
  Name: string;
}

export interface Project {
  Id: string; //IT IS  optional for new project creation
  ProjectName: string;
  Description: string;
  TeamMember: TeamMember[];
  TeamLead:TeamMember;//e
}