import { Component } from '@angular/core';
import { RoleStateService, Role } from '../services/utils/role-state.service';

@Component({
  selector: 'app-ai-role',
  templateUrl: './ai-role.component.html',
  styleUrls: ['./ai-role.component.css'],
})
export class AiRoleComponent {
  constructor(private roleState: RoleStateService) {}

  get roles(): Role[] {
    return this.roleState.getRoles();
  }

  get currentRole(): Role {
    return this.roleState.getCurrentRole();
  }

  get otherRoles(): Role[] {
    return this.roles.filter(r => r.name !== this.currentRole.name);
  }

  showOtherRole = false;

  toggleOtherRole() {
    this.showOtherRole = !this.showOtherRole;
  }

  selectRole(role: Role) {
    this.roleState.setCurrentRole(role);
    this.showOtherRole = false;
  }
}
