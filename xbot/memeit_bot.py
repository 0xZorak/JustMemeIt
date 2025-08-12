import tweepy
import time
import os
import json
import random
import requests
from dotenv import load_dotenv
import traceback
from ai_utils import get_image_caption, generate_funny_reply

load_dotenv(dotenv_path=".env")

api_key = os.getenv('API_KEY')
api_secret = os.getenv('API_SECRET')
access_token = os.getenv('ACCESS_TOKEN')
access_token_secret = os.getenv('ACCESS_TOKEN_SECRET')
bearer_token = os.getenv('BEARER_TOKEN')
bot_user_id = os.getenv('BOT_USER_ID')
backend_upload_url = os.getenv('BACKEND_UPLOAD_URL', 'http://host.docker.internal:4000/api/vote/upload-meme')

client = tweepy.Client(
    bearer_token=bearer_token,
    consumer_key=api_key,
    consumer_secret=api_secret,
    access_token=access_token,
    access_token_secret=access_token_secret
)

LAST_SEEN_FILE = "last_seen_id.json"
PROCESSED_IDS_FILE = "processed_ids.json"

def save_last_seen_id(last_seen_id):
    with open(LAST_SEEN_FILE, "w") as f:
        json.dump({"last_seen_id": last_seen_id}, f)

def load_last_seen_id():
    if os.path.exists(LAST_SEEN_FILE):
        with open(LAST_SEEN_FILE, "r") as f:
            try:
                data = json.load(f)
                if data and "last_seen_id" in data:
                    return data.get("last_seen_id")
            except Exception as e:
                print(f"Error reading {LAST_SEEN_FILE}: {e}")
    return None

def initialize_last_seen_id():
    if not os.path.exists(LAST_SEEN_FILE):
        print("Initializing last_seen_id...")
        while True:
            try:
                mentions = client.get_users_mentions(id=bot_user_id, max_results=5)
                if mentions.data:
                    save_last_seen_id(mentions.data[0].id)
                    print(f"Initialized last_seen_id to {mentions.data[0].id}")
                else:
                    print("No mentions found for initialization.")
                break  # Success, exit loop
            except tweepy.TooManyRequests:
                print("Rate limit hit during initialization. Waiting 15 minutes...")
                time.sleep(900)
            except Exception as e:
                print(f"Error initializing last_seen_id: {e}")
                print("Waiting 5 minutes before retrying...")
                time.sleep(300)

def download_image(url, filename):
    try:
        r = requests.get(url, stream=True)
        if r.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in r.iter_content(1024):
                    f.write(chunk)
            return filename
    except Exception as e:
        print(f"Error downloading image: {e}")
    return None

def load_processed_ids():
    if os.path.exists(PROCESSED_IDS_FILE):
        with open(PROCESSED_IDS_FILE, "r") as f:
            return set(json.load(f))
    return set()

def save_processed_ids(ids):
    with open(PROCESSED_IDS_FILE, "w") as f:
        json.dump(list(ids), f)

def process_mentions():
    last_seen_id = load_last_seen_id()
    processed_ids = load_processed_ids()
    try:
        mentions = client.get_users_mentions(
            id=bot_user_id,
            max_results=5,
            since_id=last_seen_id,
            expansions=["referenced_tweets.id", "attachments.media_keys", "author_id"],
            tweet_fields=["attachments", "referenced_tweets", "author_id"],
            user_fields=["username", "profile_image_url", "name"],
            media_fields=["type", "url"]
        )
    except Exception as e:
        print(f"Error fetching mentions: {e}")
        if "429" in str(e) or "Too Many Requests" in str(e):
            print("Rate limit hit. Waiting 15 minutes...")
            time.sleep(900)
        else:
            print("Network or unknown error. Waiting 5 minutes...")
            time.sleep(300)
        return

    if not mentions.data:
        print("No new mentions found.")
        return
    else:
        print(f"Fetched {len(mentions.data)} new mentions.")
        for tweet in mentions.data:
            print(f"Tweet ID: {tweet.id}, Text: {tweet.text}, Author: {tweet.author_id}")

    media = {}
    if hasattr(mentions, "includes") and mentions.includes and "media" in mentions.includes:
        media = {m["media_key"]: m for m in mentions.includes["media"]}

    users = {}
    if hasattr(mentions, "includes") and mentions.includes and "users" in mentions.includes:
        users = {u["id"]: u for u in mentions.includes["users"]}

    for tweet in reversed(mentions.data):  # oldest to newest
        if tweet.author_id == bot_user_id:
            continue
        text = tweet.text.lower()
        print(f"Processing tweet {tweet.id}: {tweet.text}")
        while True:
            try:
                if "meme it" in text:
                    image_url = None
                    parent_tweet_id = None

                    # Check if this is a reply to another tweet
                    if hasattr(tweet, "referenced_tweets") and tweet.referenced_tweets:
                        for ref in tweet.referenced_tweets:
                            if ref["type"] in ["replied_to", "quoted"]:
                                parent_tweet_id = ref["id"]
                                break

                    # 1. Try to get image from parent tweet (the tweet being replied to)
                    if parent_tweet_id:
                        print(f"Fetching parent tweet {parent_tweet_id} for images...")
                        parent = client.get_tweet(
                            parent_tweet_id,
                            expansions=["referenced_tweets.id", "attachments.media_keys"],
                            tweet_fields=["attachments", "referenced_tweets"],
                            media_fields=["type", "url"]
                        )
                        print("Parent tweet raw:", parent)
                        parent_media = {}
                        if hasattr(parent, "includes") and parent.includes and "media" in parent.includes:
                            parent_media = {m["media_key"]: m for m in parent.includes["media"]}
                        media_keys = []
                        if hasattr(parent.data, "attachments") and parent.data.attachments and "media_keys" in parent.data.attachments:
                            media_keys = parent.data.attachments["media_keys"]
                        for key in media_keys:
                            m = parent_media.get(key)
                            if m and m.get("type") == "photo":
                                image_url = m.get("url")
                                break

                    # 2. If no image in parent, check the mention tweet itself
                    if not image_url:
                        print(f"No image found in parent tweet. Checking mention tweet {tweet.id} for images...")
                        media_keys = []
                        if hasattr(tweet, "attachments") and tweet.attachments and "media_keys" in tweet.attachments:
                            media_keys = tweet.attachments["media_keys"]
                        for key in media_keys:
                            m = media.get(key)
                            if m and m.get("type") == "photo":
                                image_url = m.get("url")
                                break

                    if image_url:
                        print(f"Found image: {image_url}")
                        filename = f"tweet_{parent_tweet_id or tweet.id}.jpg"
                        local_path = download_image(image_url, filename)
                        if local_path:
                            # 1. Get a meme-style caption from the image
                            try:
                                meme_caption = get_image_caption(image_url)
                                print(f"AI Caption: {meme_caption}")
                            except Exception as e:
                                print(f"AI captioning failed: {e}")
                                meme_caption = None

                            # 2. Generate a funny reply using LLM
                            try:
                                if meme_caption:
                                    funny_reply = generate_funny_reply(meme_caption)
                                else:
                                    funny_reply = "memeing it!"  # fallback
                                print(f"AI Reply: {funny_reply}")
                            except Exception as e:
                                print(f"AI reply generation failed: {e}")
                                funny_reply = "memeing it!"

                            # 3. Reply to the tweet with the AI-generated funny reply
                            try:
                                client.create_tweet(
                                    in_reply_to_tweet_id=tweet.id,
                                    text=funny_reply
                                )
                                print(f"Replied to tweet ID {tweet.id} with AI reply")
                            except Exception as e:
                                print(f"Error replying to {tweet.id}: {e}")

                            # Check if already processed
                            if (parent_tweet_id or tweet.id) in processed_ids:
                                print(f"Already processed tweet {parent_tweet_id or tweet.id}, skipping upload.")
                                if os.path.exists(local_path):
                                    os.remove(local_path)
                                break  # skip to next tweet

                            # --- Get user info from users dict, not Twitter API ---
                            author = users.get(str(tweet.author_id), {})
                            username = author.get("username", "")
                            name = author.get("name", "")
                            profile_image_url = author.get("profile_image_url", "")

                            # Upload to backend
                            try:
                                upload_success = False
                                upload_attempts = 0
                                while upload_attempts < 5:
                                    with open(local_path, 'rb') as img_file:
                                        files = {'image': img_file}
                                        data = {
                                            "tweet_id": parent_tweet_id or tweet.id,
                                            "user_id": tweet.author_id,
                                            "username": username,
                                            "name": name,
                                            "profile_image_url": profile_image_url,
                                            "caption": tweet.text
                                        }
                                        try:
                                            resp = requests.post(backend_upload_url, data=data, files=files)
                                            print(f"Retry {upload_attempts}: got {resp.status_code}; headers: {resp.headers}")
                                            if resp.status_code == 429:
                                                print("Backend rate limited us (429). Waiting 30 seconds before retry...")
                                                time.sleep(30)
                                                upload_attempts += 1
                                                continue
                                            elif resp.status_code >= 400:
                                                print(f"Upload failed with {resp.status_code}: {resp.text}")
                                                print(f"Headers: {resp.headers}")
                                                break
                                            else:
                                                print(f"Uploaded meme for user {username}: {resp.status_code}")
                                                upload_success = True
                                                break
                                        except Exception as e:
                                            print(f"Exception during upload: {e}")
                                            break
                                if upload_success:
                                    processed_ids.add(parent_tweet_id or tweet.id)
                                    save_processed_ids(processed_ids)
                            except Exception as e:
                                print(f"Error uploading image to backend: {e}")
                                traceback.print_exc()
                            finally:
                                if os.path.exists(local_path):
                                    os.remove(local_path)
                        else:
                            print(f"Failed to download image from {image_url}")
                    else:
                        print(f"No image found in parent or mention tweet for {tweet.id}. Skipping.")
                else:
                    print("No 'meme it' in tweet, skipping.")
                # If we reach here, processing was successful or intentionally skipped
                save_last_seen_id(tweet.id)
                break  # move to next tweet
            except Exception as e:
                print(f"Exception processing tweet {tweet.id}: {e}")
                traceback.print_exc()
                if isinstance(e, tweepy.TooManyRequests) or "429" in str(e) or "Too Many Requests" in str(e):
                    print("Rate limit hit. Waiting 15 minutes before retrying this tweet...")
                    time.sleep(900)
                    # do not break; retry this tweet after sleep
                else:
                    # For other errors, skip to next tweet but do not update last_seen_id
                    break

if __name__ == "__main__":
    required_vars = [api_key, api_secret, access_token, access_token_secret, bearer_token, bot_user_id]
    print("Loaded API Key:", api_key)
    if not all(required_vars):
        raise ValueError("One or more Twitter API credentials are missing! Check your .env file.")

    initialize_last_seen_id()
    while True:
        try:
            process_mentions()
            time.sleep(900)  # check every 15 minutes
        except tweepy.TooManyRequests:
            print("Rate limit hit. Waiting 15 minutes...")
            time.sleep(900)
        except Exception as e:
            print(f"Error fetching mentions: {e}")
            if "429" in str(e) or "Too Many Requests" in str(e):
                print("Rate limit hit. Waiting 15 minutes...")
                time.sleep(900)
            else:
                print("Network or unknown error. Waiting 5 minutes...")
                time.sleep(300)