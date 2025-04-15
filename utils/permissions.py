\
import json
import os

ROLES_FILE = os.path.join(os.path.dirname(__file__), '..', 'static', 'assets', 'js', 'permissions', 'roles.json')

def load_roles():
    """Loads role definitions from the JSON file."""
    try:
        with open(ROLES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f).get("roles", {})
    except FileNotFoundError:
        print(f"Error: Roles file not found at {ROLES_FILE}")
        return {}
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {ROLES_FILE}")
        return {}

def check_permission(user_role, required_path, roles_config):
    """
    Checks if a user role has access to a specific path based on roles.json.
    Note: This needs refinement to match the exact structure and logic 
    of your menuAccess.js and how you define permissions per route/path.
    This is a basic example assuming roles.json grants access if the path exists under the role.
    """
    if not user_role or user_role not in roles_config:
        return False # Role doesn't exist

    role_permissions = roles_config[user_role].get("menuAccess", {})

    # This logic needs to be adapted based on how you map paths to permissions.
    # Example: Check if any top-level menu key grants access, 
    # or if a specific sub-item path matches.
    # This is a simplified check:
    for menu_key, access_info in role_permissions.items():
        if isinstance(access_info, dict) and access_info.get('path') == required_path:
             return True
        # Add more complex checks for nested menus if needed
        
    # Fallback: Maybe top-level access implies access? Adapt as needed.
    # print(f"Permission check: Role '{user_role}' accessing '{required_path}'. Needs specific logic.")

    # Default to deny if no specific rule grants access
    return False 

# Example usage (demonstration):
if __name__ == '__main__':
    roles = load_roles()
    print("Loaded Roles:", json.dumps(roles, indent=2))
    
    # Test checks (adjust paths based on your actual routes/permissions)
    test_role = 'administrador'
    test_path_allowed = '../seguimiento/seguimiento.html' # Example from roles.json
    test_path_denied = '/some/other/path'
    
    print(f"Checking if '{test_role}' can access '{test_path_allowed}': {check_permission(test_role, test_path_allowed, roles)}")
    print(f"Checking if '{test_role}' can access '{test_path_denied}': {check_permission(test_role, test_path_denied, roles)}")

    test_role_limited = 'asesor'
    print(f"Checking if '{test_role_limited}' can access '{test_path_allowed}': {check_permission(test_role_limited, test_path_allowed, roles)}")

