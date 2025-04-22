
from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import shutil
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/files', methods=['GET'])
def list_files():
    directory = request.args.get('directory', '.')
    # Secure against directory traversal attacks
    if '..' in directory:
        return jsonify({"error": "Invalid directory path"}), 400
    
    try:
        items = []
        for item in os.listdir(directory):
            path = os.path.join(directory, item)
            item_type = 'directory' if os.path.isdir(path) else 'file'
            items.append({
                'name': item,
                'type': item_type,
                'path': path,
                'size': os.path.getsize(path) if os.path.isfile(path) else 0,
                'modified': os.path.getmtime(path)
            })
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/files', methods=['POST'])
def create_directory():
    data = request.json
    directory = data.get('directory', '.')
    name = data.get('name')
    
    if '..' in directory or not name:
        return jsonify({"error": "Invalid request"}), 400
    
    try:
        path = os.path.join(directory, name)
        os.makedirs(path, exist_ok=True)
        return jsonify({"success": True, "message": f"Directory {name} created"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/files/<path:filepath>', methods=['PUT'])
def rename_item(filepath):
    data = request.json
    new_name = data.get('newName')
    
    if not new_name or '..' in filepath:
        return jsonify({"error": "Invalid request"}), 400
    
    try:
        directory = os.path.dirname(filepath)
        new_path = os.path.join(directory, new_name)
        shutil.move(filepath, new_path)
        return jsonify({"success": True, "message": f"Item renamed to {new_name}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/files/<path:filepath>', methods=['DELETE'])
def delete_item(filepath):
    if '..' in filepath:
        return jsonify({"error": "Invalid path"}), 400
    
    try:
        if os.path.isdir(filepath):
            shutil.rmtree(filepath)
        else:
            os.remove(filepath)
        return jsonify({"success": True, "message": f"Item deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<path:filepath>')
def download_file(filepath):
    if '..' in filepath:
        return jsonify({"error": "Invalid path"}), 400
    
    directory = os.path.dirname(filepath)
    filename = os.path.basename(filepath)
    return send_from_directory(directory, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
