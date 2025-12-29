import sys
from gensim.models import KeyedVectors
import nltk
from nltk.stem import WordNetLemmatizer
from wordfreq import zipf_frequency 
import os

# --- SETUP NLTK ---
try:
    nltk.data.find('corpora/wordnet.zip')
    nltk.data.find('taggers/averaged_perceptron_tagger.zip') # Need this for POS tagging
except LookupError:
    print("Downloading NLTK data...")
    nltk.download('wordnet')
    nltk.download('omw-1.4')
    nltk.download('averaged_perceptron_tagger') # <--- NEW DOWNLOAD
    nltk.download('averaged_perceptron_tagger_eng')

def load_model():
    print("Loading model from binary file...")
    
    # Path to the binary file created by preload_data.py
    model_path = os.path.join(os.getcwd(), "glove_100d.model")
    
    if os.path.exists(model_path):
        # Load using mmap='r' (Memory Mapping) - This is INSTANT
        model = KeyedVectors.load(model_path, mmap='r')
        print("Model loaded successfully (Binary Mode)!")
        return model
    else:
        # Fallback (Should not happen on Render if build works)
        print("Binary file not found! Falling back to slow download...")
        import gensim.downloader as api
        return api.load("glove-wiki-gigaword-100")

def is_valid(clue, board_words):
    lemmatizer = WordNetLemmatizer()
    clue = clue.lower()
    
    # Check frequency (Common Sense Filter)
    # 3.0 cuts off words like 'Bartoli' or 'Cytoplasm'. 
    # 4.0 restricts it to very common words like 'Food', 'Home'.
    freq = zipf_frequency(clue, 'en')
    if freq < 3.5: 
        return False

    # Check Part of Speech (Grammar Filter)
    # We want Nouns (NN), Adjectives (JJ). We dislike Verbs (VB).
    # pos_tag expects a list, returns [('word', 'TAG')]
    pos_tag = nltk.pos_tag([clue])[0][1]
    if not pos_tag.startswith('N') and not pos_tag.startswith('J'):
        return False

    clue_root = lemmatizer.lemmatize(clue)

    for word in board_words:
        word = word.lower()
        if word in clue or clue in word:
            return False
        word_root = lemmatizer.lemmatize(word)
        if clue_root == word_root:
            return False
            
    return True

def get_best_clue(positive_words, negative_words, model):
    print(f"Thinking... Finding connection for {positive_words}")

    positive_words = [w.lower() for w in positive_words]
    negative_words = [w.lower() for w in negative_words]
    # 2. VALIDATION: Check if words exist in the model
    # If a user types a typo (e.g. "asdfg"), we must remove it or the model will crash
    positive_words = [w for w in positive_words if w in model.key_to_index]
    negative_words = [w for w in negative_words if w in model.key_to_index]

    if not positive_words:
        return []

    candidates = model.most_similar(positive=positive_words, topn=1000) # Look even deeper
    scored_candidates = []

    for candidate_word, similarity_score in candidates:
        candidate_word = candidate_word.replace("_", " ")

        # 1. Validation Check (Now includes Frequency and POS)
        all_board_words = positive_words + negative_words
        if not is_valid(candidate_word, all_board_words):
            continue

        # 2. Penalty Check
        max_penalty = 0.0
        for bad_word in negative_words:
            if bad_word in model.key_to_index:
                bad_sim = model.similarity(candidate_word, bad_word)
                if bad_sim > max_penalty:
                    max_penalty = bad_sim
        
        final_score = similarity_score - (3.0 * max_penalty)
        scored_candidates.append((final_score, candidate_word))

    scored_candidates.sort(key=lambda x: x[0], reverse=True)

    if not scored_candidates:
        return "NO CLUE FOUND", 0.0

    top_5 = []
    for score, word in scored_candidates[:5]:
        top_5.append({
            "word": word,
            "score": float(score)
        })

    return top_5

