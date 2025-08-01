from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def recommend(user_input, tattoo_data, top_k=3):
    descriptions = [t["description"] for t in tattoo_data]
    if not descriptions:
        return []
    desc_embeddings = model.encode(descriptions)
    input_vec = model.encode([user_input])
    similarities = cosine_similarity(input_vec, desc_embeddings)[0]
    top_indices = similarities.argsort()[-top_k:][::-1]
    results = []
    for idx in top_indices:
        t = tattoo_data[idx]
        results.append({
            "name": t["name"],
            "description": t["description"],
            "image": t["image"]
        })
    return results
