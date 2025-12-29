import os
import nltk
import gensim.downloader as api

# 1. Force Gensim to save models in the current folder (so Render keeps them)
# We set the environment variable just for this script
os.environ["GENSIM_DATA_DIR"] = os.path.join(os.getcwd(), "gensim-data")

print("--- PRELOAD: Downloading NLTK Data ---")
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('averaged_perceptron_tagger')
nltk.download('averaged_perceptron_tagger_eng')

print("--- PRELOAD: Downloading GloVe Model (This takes time) ---")
# This downloads the model and saves it to ./gensim-data
path = api.load("glove-wiki-gigaword-100", return_path=True)
print(f"Model saved to: {path}")