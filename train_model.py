# train_model.py

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import pickle

def train_and_save_model(X_train, X_test, y_train, y_test, scaler, pca, selector):
    # Train Model
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    # Save Trained Model(s)
    with open('model.pkl', 'wb') as f:
        pickle.dump(clf, f)
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    with open('pca.pkl', 'wb') as f:
        pickle.dump(pca, f)
    with open('selector.pkl', 'wb') as f:
        pickle.dump(selector, f)

if __name__ == "__main__":
    import preprocess
    X_train_pca, X_test_pca, y_train, y_test, scaler, pca = preprocess.load_and_preprocess_data('IoT_Intrusion.csv')
    train_and_save_model(X_train_pca, X_test_pca, y_train, y_test, scaler, pca)