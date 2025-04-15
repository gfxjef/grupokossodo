\
from flask import Flask, render_template, session, redirect, url_for, request, jsonify
import os
from functools import wraps
# Import permission utils later when created
# from utils.permissions import check_permission, load_roles

app = Flask(__name__, static_folder='static', template_folder='templates')
# Secret key is needed for session management. Use an environment variable in production!
app.secret_key = os.environ.get('SECRET_KEY', 'your_development_secret_key') 

# Placeholder for roles - load from JSON in a real scenario
# ROLES = load_roles() 

# --- Authentication Decorator ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        # Add role-based permission check here if needed for the route
        # user_role = session['user'].get('role')
        # required_permission = 'some_permission_for_this_route' # Example
        # if not check_permission(user_role, required_permission, ROLES):
        #     return "Access Denied", 403 
        return f(*args, **kwargs)
    return decorated_function

# --- Routes ---
@app.route('/')
def index():
    # Redirect logic from original index.html
    if 'user' in session:
        return redirect(url_for('welcome'))
    else:
        return redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    # If user is already logged in, redirect to welcome
    if 'user' in session:
        return redirect(url_for('welcome'))
    return render_template('login.html')

@app.route('/set-session', methods=['POST'])
def set_session():
    # This endpoint is called by auth.js AFTER successful external authentication
    data = request.get_json()
    if not data or 'usuario' not in data or 'role' not in data:
         return jsonify({'status': 'error', 'message': 'Missing user data'}), 400
    
    # Store user info in session
    session['user'] = {
        'username': data['usuario'],
        'role': data['role'] 
        # Add any other relevant user info received from external auth
    }
    print(f"Session set for user: {session['user']['username']}, role: {session['user']['role']}") # Debugging
    return jsonify({'status': 'success'})

@app.route('/logout')
def logout():
    session.pop('user', None) # Clear user session
    return redirect(url_for('login'))

@app.route('/welcome')
@login_required
def welcome():
    # Pass user data to the template if needed
    user_info = session.get('user')
    return render_template('welcome.html', user=user_info)

# --- Add routes for other components here, applying @login_required ---
# Example:
@app.route('/inventario')
@login_required
def inventario():
     user_info = session.get('user')
     # Add permission check if needed:
     # if not check_permission(user_info['role'], 'access_inventario', ROLES): return "Access Denied", 403
     return render_template('components/inventario/inventario.html', user=user_info)

@app.route('/merchandising/solicitud')
@login_required
def merchandising_solicitud():
     user_info = session.get('user')
     return render_template('components/Merchandising/solicitud.html', user=user_info)

# Add routes for all other HTML pages similarly...
# /feedback/califica, /feedback/encuesta, /merchandising/confirmacion, etc.

# --- Serve Component-Specific Assets (Example for tracking.css) ---
# While Flask serves /static automatically, sometimes specific routes might be needed
# if paths are tricky in JS/CSS. Usually url_for is sufficient.
# @app.route('/components/seguimiento/<path:filename>')
# def serve_seguimiento_asset(filename):
#     return send_from_directory('static/assets/components/seguimiento', filename)


if __name__ == '__main__':
    # Use 0.0.0.0 to be accessible externally (needed for Render)
    # Debug=True is helpful during development, REMOVE for production
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
