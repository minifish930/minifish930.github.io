import os
import urllib.parse
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'attachments'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/display')
def display():
    return render_template('display.html')

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('attachment')
    if file:
        filename = secure_filename(file.filename)
        safe_filename = urllib.parse.quote(filename)  # 处理中文文件名
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        file.save(filepath)
        return jsonify({'attachment': safe_filename})
    return jsonify({'attachment': None})

@app.route('/attachments/<path:filename>')
def uploaded_file(filename):
    decoded_filename = urllib.parse.unquote(filename)  # 解码中文文件名
    return send_from_directory(app.config['UPLOAD_FOLDER'], decoded_filename)

@app.route('/conferences.json')
def conferences():
    return send_from_directory('.', 'conferences.json')

if __name__ == '__main__':
    app.run(debug=True)
