# preprocess.py

import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import VarianceThreshold
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split

def load_and_preprocess_data(file_path, variance_threshold=0.1, pca_variance=0.95):
    # Load Dataset
    df = pd.read_csv(file_path)

    # Split Labels
    X = df.drop(columns=['label'])
    y = df['label']

    # Split Into Test Sets (80-20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Apply Variance Threshold
    selector = VarianceThreshold(threshold=variance_threshold)
    X_train_reduced = selector.fit_transform(X_train)
    X_test_reduced = selector.transform(X_test)

    # Standardize Scaler Features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_reduced)
    X_test_scaled = scaler.transform(X_test_reduced)

    # Apply PCA
    pca = PCA(n_components=pca_variance)
    X_train_pca = pca.fit_transform(X_train_scaled)
    X_test_pca = pca.transform(X_test_scaled)

    return X_train_pca, X_test_pca, y_train, y_test, scaler, pca, selector

def load_test_data(file_path):
    df = pd.read_csv(file_path)
    X = df.drop(columns=['label'])
    return X
