import os
import nltk
import gensim.downloader as api
from gensim.models import KeyedVectors

# 1. Define paths
root_dir = os.getcwd()
model_path = os.path.join(root_dir, "glove_100d.model")

print("--- PRELOAD: Downloading NLTK Data ---")
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('averaged_perceptron_tagger')
nltk.download('averaged_perceptron_tagger_eng')

print("--- PRELOAD: Downloading and Converting GloVe Model ---")
# If the binary model doesn't exist yet, create it
if not os.path.exists(model_path):
    print("Downloading raw vectors...")
    # Download the raw model
    model = api.load("glove-wiki-gigaword-100")
    
    print("Saving as binary file (fast load format)...")
    # Save it as a Gensim binary file
    model.save(model_path)
    print(f"Model saved to: {model_path}")
else:
    print("Binary model already exists. Skipping download.")