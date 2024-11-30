def load_env(filepath):
    """Read the .env file and return variables as a dictionary."""
    env_vars = {}
    try:
        with open(filepath, 'r') as file:
            for line in file:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return env_vars
