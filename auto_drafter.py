import os.path
import base64
from email.message import EmailMessage
import google.generativeai as genai

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# ==========================================
# CONFIGURATION
# ==========================================
# We will pass this securely via GitHub Secrets!
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set!")
    exit(1)

SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
MY_EMAIL = 'creationcuespace@gmail.com'

# Configure the AI
genai.configure(api_key=GEMINI_API_KEY)
# We use the standard gemini model
model = genai.GenerativeModel('gemini-2.5-flash')

AI_INSTRUCTIONS = """
You are an email assistant for the app 'Creation Cue'.
Read the following email. 
First, determine if it is a human user asking for support, reporting a bug, or asking a question.
If it is a system notification (like Google Play), a newsletter, or spam, respond ONLY with the word "IGNORE".
If it IS a human support request, write a draft response. 
Style Rules: Keep it casual, friendly, and DO NOT repeat or quote their words. Answer directly. End with "Cheers, Creation Cue Team".
"""

def create_draft(service, to, subject, body_text):
    message = EmailMessage()
    message.set_content(body_text)
    message['To'] = to
    message['From'] = MY_EMAIL
    
    # If it doesn't already have 'Re:', add it so it groups in the thread
    if not subject.lower().startswith("re:"):
        subject = "Re: " + subject
    message['Subject'] = subject

    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    create_message = {'message': {'raw': encoded_message}}
    
    draft = service.users().drafts().create(userId="me", body=create_message).execute()
    return draft['id']

def main_logic():
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    service = build('gmail', 'v1', credentials=creds)

    print("Fetching the latest unread emails...")
    results = service.users().messages().list(userId='me', labelIds=['INBOX', 'UNREAD'], maxResults=10).execute()
    messages = results.get('messages', [])

    if not messages:
        print("No new unread messages found.")
        return

    for message in messages:
        msg = service.users().messages().get(userId='me', id=message['id'], format='full').execute()
        
        headers = msg['payload']['headers']
        subject = next((header['value'] for header in headers if header['name'] == 'Subject'), 'No Subject')
        sender = next((header['value'] for header in headers if header['name'] == 'From'), 'Unknown Sender')
        
        body = "No text body available"
        parts = [msg['payload']]
        while parts:
            part = parts.pop(0)
            if part.get('parts'):
                parts.extend(part['parts'])
            if part.get('mimeType') == 'text/plain':
                data = part.get('body', {}).get('data', '')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8')
                    break
        
        print(f"\nEvaluating email from: {sender}")
        
        # Ask AI to evaluate and draft
        ai_prompt = f"{AI_INSTRUCTIONS}\n\nEMAIL SUBJECT: {subject}\nEMAIL BODY:\n{body}"
        try:
            response = model.generate_content(ai_prompt)
            ai_reply = response.text.strip()
            
            if ai_reply == "IGNORE" or "IGNORE" in ai_reply[:10]:
                print("-> AI decided to IGNORE this email (Not a support request).")
            else:
                print("-> AI generated a draft! Uploading to Gmail...")
                # Extract email address from Sender string "Name <email@domain.com>"
                import re
                email_match = re.search(r'<([^>]+)>', sender)
                to_address = email_match.group(1) if email_match else sender
                
                draft_id = create_draft(service, to_address, subject, ai_reply)
                print(f"-> Draft created successfully! (ID: {draft_id})")
                
        except Exception as e:
            print(f"Error calling AI: {e}")

if __name__ == '__main__':
    main_logic()
