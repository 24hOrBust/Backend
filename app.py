import os
import json
import base64
import uuid
from flask import Flask, request, abort, jsonify, render_template
from pymongo import MongoClient
from watson_developer_cloud import VisualRecognitionV3
from io import BytesIO

color_map = {
    "01_Short_Grass"            : "#00FF00",
    "02_Grass_Timber_Shrub"     : "#22DD00",
    "04_Mature_Brush"           : "#44BB00",
    "05_Young_Brush"            : "#669900",
    "09_08_Tree_Litter"         : "#887700",
    "10_Overmature_Timber"      : "#AA5500",
    "11_Slash"                  : "#CC3300"
}

name_map = {
    "01_Short_Grass"            : "Short Grass",
    "02_Grass_Timber_Shrub"     : "Grass with Timber/Shrub Overstory",
    "04_Mature_Brush"           : "Mature Brush",
    "05_Young_Brush"            : "Young Brush",
    "09_08_Tree_Litter"         : "Tree Litter",
    "10_Overmature_Timber"      : "Overmature Timber",
    "11_Slash"                  : "Slash"
}

def calcualte_rof(classification):
    return 100

def build_mongo_client():
    raw_creds = os.environ.get('VCAP_SERVICES')
    if not raw_creds:
        return MongoClient('mongodb://localhost:27017')
    
    creds = json.loads(raw_creds)
    uri = creds['compose-for-mongodb'][0]['credentials']['uri']

    return MongoClient(uri)

visual_recognition = VisualRecognitionV3('2018-03-19',
                                         iam_apikey='K_oihoJ6QnmtfzjpknabMBEmlEll9x2dqrV1cY0SstkO')
client = build_mongo_client()
app = Flask(__name__)

def img_decode(image_base64):
    missing_padding = len(image_base64) % 4
    if missing_padding != 0:
        image_base64 += '='* (4 - missing_padding)
    return base64.standard_b64decode(image_base64)

def get_highest_class(classes):
    return max(classes, key= lambda c : c['score'])

def classify(image_base64):
    image = img_decode(image_base64)
    filename = str(uuid.uuid4()) + '.jpg'
    with open(filename, 'wb') as f:
        f.write(image)
    with open(filename,'rb') as f:
        class_data = visual_recognition.classify(
            images_file = f,
            threshold='0.0',
            classifier_ids = ['FuelImageAnalyzer_511154762']
        )

        max_class = get_highest_class(class_data.result['images'][0]['classifiers'][0]['classes'])

        return max_class['class']

    return 'tree'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/v1/measurement', methods=['POST'])
def upload_measurement():
    data = request.form
    
    classification = classify(data['image_data'])

    client.fuel_scan.messurements.insert_one({
        'position':{
            'lat':float(data['lat']),
            'lng':float(data['lng'])
        },
        'classification':classification
    })

    return jsonify({
        'message':'ok',
        'result':{
            'classification':classification
        }
    })

@app.route('/api/v1/map.geojson')
def get_geo_json():
    ret = {}
    ret['type'] = 'FeatureCollection'
    lst = []

    for mes in client.fuel_scan.messurements.find():
        tmp = {}
        tmp['type'] = 'Feature'
        tmp['properties'] = { 'fuel-type-color' : color_map.get(mes['classification'], "#0000FF"),
                            'fuel-type-name' : name_map.get( mes['classification'], 'Unknown' ),
                            'rate-of-spread': calcualte_rof(mes['classification'])
        }
        tmp['geometry'] = {
            'type' : 'Point',
            'coordinates' : [ mes['position']['lng'], mes['position']['lat'] ]
        }
        lst.append(tmp)
    
    ret['features'] = lst

    return jsonify(ret)

port = os.getenv('VCAP_APP_PORT', '5000')
if __name__ == "__main__":
	app.run(host='0.0.0.0', port=int(port))