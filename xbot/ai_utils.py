from transformers import pipeline, BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import requests
import os
import time
from dotenv import load_dotenv

load_dotenv()

hf_token = os.getenv("HF_API_TOKEN")
if not hf_token:
    raise ValueError("Missing HF_API_TOKEN in .env")

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

# Load GPT-2 pipeline once
gpt2_pipe = pipeline("text-generation", model="openai-community/gpt2")

def get_image_caption(image_url: str) -> str | None:
    try:
        with requests.get(image_url, stream=True) as img_resp:
            img_resp.raise_for_status()
            image = Image.open(img_resp.raw).convert('RGB')
        inputs = processor(image, return_tensors="pt")
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return caption
    except Exception as e:
        print(f"Error with local BLIP: {e}")
        return None

def generate_funny_reply(caption, max_retries=3):
    api_url = "https://api-inference.huggingface.co/models/google/gemma-2b-it"
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": "application/json"
    }
    prompt = (
        "Here are some meme examples:\n"
        "Meme description: a cat wearing sunglasses\nMeme reply: Too cool for catnip!\n"
        "Meme description: a dog chasing its tail\nMeme reply: Monday mood.\n"
        f"Meme description: {caption}\nMeme reply:"
    )
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 40,
            "temperature": 0.7
        }
    }
    for attempt in range(max_retries):
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            result = response.json()
            print(f"Hugging Face API response: {result}")  # For debugging
            if isinstance(result, dict) and "error" in result and "loading" in result["error"]:
                print("Model is loading, retrying...")
                time.sleep(5 * (attempt + 1))
                continue
            if isinstance(result, list) and isinstance(result[0], dict) and "generated_text" in result[0]:
                reply = result[0]["generated_text"].strip()
                return reply.split('\n')[0]
            return "memeing it!"
        except Exception as e:
            print(f"Error with Hugging Face Inference API (attempt {attempt+1}): {e}")
            time.sleep(2 * (attempt + 1))
    return "memeing it!"