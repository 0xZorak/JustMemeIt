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
    prompt = (
        f"Meme description: {caption}\nWrite a short, funny meme reply:"
    )
    try:
        result = gpt2_pipe(prompt, max_new_tokens=40, temperature=0.9)
        reply = result[0]["generated_text"].strip()
        # Remove the prompt from the reply if present
        if reply.lower().startswith(prompt.lower()):
            reply = reply[len(prompt):].strip()
        # Return only the first line (short meme reply)
        return reply.split('\n')[0]
    except Exception as e:
        print(f"Error with local GPT-2: {e}")
        return "memeing it!"