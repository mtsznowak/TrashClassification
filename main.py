from flask import Flask
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename
import os
import io
import json
import sys
from pprint import pprint

UPLOAD_FOLDER = '/tmp/'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
import os
if os.path.isfile("TrashClass-069665b8ead8.json"):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]= "TrashClass-069665b8ead8.json" 
else:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"]= "/var/www/ml/TrashClass-069665b8ead8.json"

if os.path.isfile("tags"):
    tags_file = "tags" 
else:
    tags_file= "/var/www/ml/tags"

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_labels(path):
    """Detects labels in the file."""
    from google.cloud import vision
    client = vision.ImageAnnotatorClient()

    with io.open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.types.Image(content=content)

    response = client.label_detection(image=image)
    labels = response.label_annotations
    print('Labels:')

    for label in labels:
        print(label.description)
    return labels

def recognize(labels):
    
    tags_map = {}
    with open(tags_file) as fin:
        for line in fin:
            line = line[:-1]
            x = line.split(': ', 2)
            value = x[1]
            if x[0] in tags_map:
                tags_map[x[0]].append(x[1])
            else:
                tags_map[x[0]] = [x[1]]
    
    points = {'bio' : 0, 'elektronika' : 0, 'metal-plastik' : 0, 'papier' : 0, 'szklo' : 0, 'zmieszane' : 0}
    for x in labels:
        text = x.description.lower()

        if 'meat' in text:
            return 'zmieszane'
        category = ''
        max_len = 0

        for key, value_list in tags_map.items():
            for value in value_list:
                if value in text and len(value) > max_len:
                    max_len = len(value)
                    category = key
        if category == '':
            continue
        # print ( text + " " + category + " " + str(x.score))
        points[category] = points[category] + x.score
    
    result = 'zmieszane'
    max_score = 0.0
    for (x, y) in points.items():
        # print (x + " " + str(y))
        if y > max_score:
            max_score = y
            result = x
    if max_score < 0.5:
        return 'nie-rozpoznano'
    return result



@app.route('/response')
def response():
    labels = request.args['labels']
    pprint(labels)
    # l = json.loads(labels)
    return labels

@app.route("/", methods=['GET', 'POST'])
def hello(): 
    if request.method == 'POST':  
        # check if the post request has the fil e part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename  
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename): 
            filename = secure_filename(file.filename)
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(path) 
            labels = detect_labels(path)
            # os.remove(path)
            print(path, file=sys.stderr)
            print(labels, file=sys.stderr)
            return str(recognize(labels))
    return '''
    <!doctype html>
    <title>Upload new File X</title>
    <h1>Upload new File</h1> 
    <form method=post enctype=multipart/form-data>
      <p><input type=file name=file>
         <input type=submit value=Upload>
    </form>
    '''

