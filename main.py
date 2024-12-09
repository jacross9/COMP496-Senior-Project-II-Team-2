# main.py

import table_creation
import preprocess
import train_model
import packet_monitor
import os
import pickle
import requests
from flask import Flask, request, jsonify
from sklearn.metrics import accuracy_score, classification_report

def main():
    # Makes call to table_creation.csv
    table_creation.create_table('IoT_Intrusion.csv')

    # Makes Call To preprocess.py
    X_train_pca, X_test_pca, y_train, y_test, scaler, pca, selector = preprocess.load_and_preprocess_data('IoT_Intrusion.csv')

    # Makes Call To train_model.py
    # REMOVE QUOTATIONS TO TRAIN NEW MODEL IF .pkl FILES ARE NOT STORED LOCALLY
    '''
    if os.path.exists('model.pkl'):
        os.remove('model.pkl')
    if os.path.exists('scaler.pkl'):
        os.remove('scaler.pkl')
    if os.path.exists('pca.pkl'):
        os.remove('pca.pkl')
    if os.path.exists('selector.pkl'):
        os.remove('selector.pkl')
    if not os.path.exists('model.pkl'):
        print("Model not found. Training a new model...")
        train_model.train_and_save_model(X_train_pca, X_test_pca, y_train, y_test, scaler, pca, selector)
    else:
    '''
    # REMOVE QUOTATIONS TO TRAIN NEW MODEL IF .pkl FILES NOT STORED LOCALLY
    print("Model found. Skipping training...")
    with open('model.pkl', 'rb') as model_file:
        clf = pickle.load(model_file)
    with open('scaler.pkl', 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
    with open('pca.pkl', 'rb') as pca_file:
        pca = pickle.load(pca_file)
    with open('selector.pkl', 'rb') as selector_file:
        selector = pickle.load(selector_file)

    # Create Prediction Report
    y_pred = clf.predict(X_test_pca)
    print("Classification Report:\n", classification_report(y_test, y_pred, zero_division=0))
    print(f"Accuracy: {accuracy_score(y_test, y_pred)}")

    # Makes Call To packet_monitoring.py
    packet_monitor.start_packet_monitoring()

def send_data_to_node(source_ip, dest_ip, message):
    url = 'http://localhost:3000/data'  # Replace with your Node.js server URL
    payload = {
        'sourceIP': source_ip,
        'destIP': dest_ip,
        'message': message
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print('Data sent successfully:', response.json())
        else:
            print('Failed to send data:', response.status_code, response.text)
    except Exception as e:
        print('Error connecting to Node.js server:', e)

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_data():
    data = request.get_json()
    print('Data received from Node.js:', data)
    return jsonify({'success': True, 'message': 'Data processed'})

if __name__ == '__main__':
    app.run(port=5000)

if __name__ == '__main__':
    main()
