# main.py

import table_creation
import preprocess
import train_model
import packet_monitor
import os
import pickle
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


if __name__ == '__main__':
    main()
