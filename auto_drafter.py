import os
import email
from email.message import EmailMessage
import imaplib
import time
import base64
import re
from google import genai

# ==========================================
# CONFIGURATION
# ==========================================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not set!")
    exit(1)
if not GMAIL_APP_PASSWORD:
    print("Error: GMAIL_APP_PASSWORD not set! Make sure you added it to GitHub Secrets.")
    exit(1)

MY_EMAIL = 'creationcuespace@gmail.com'

# Configure Gemini
client = genai.Client(api_key=GEMINI_API_KEY)

AI_INSTRUCTIONS = """
You are an expert email support assistant for the app developer 'Creation Cue'.
Read the following email. 
First, determine if it is a human user asking for support, reporting a bug, or asking a question.
If it is a system notification (like Google Play), a newsletter, or spam, respond ONLY with the word "IGNORE".
If the email contains a "Describe your issue" section and that section is empty (or blank), respond ONLY with the word "IGNORE".
If it IS a human support request, write a draft response. 

RESEARCH REQUIREMENT:
Before drafting your response, if the user mentions a specific watch face, app, complication, or feature, you MUST use your Google Search tool to search for the Creation Cue app on the Google Play Store (e.g., search "Creation Cue [Watch Face Name] Google Play"). 
Read the 'About this app' section and any instructions or FAQs on the store page to ensure your answer is completely accurate based on how the app actually works.

Style Rules: 
- Keep the response VERY short and straight to the point. Do not ramble.
- Keep it casual and friendly.
- DO NOT repeat or quote their words. Answer directly. 
- End with "Cheers, Creation Cue Team".
"""

def get_email_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            if content_type == 'text/plain':
                return part.get_payload(decode=True).decode('utf-8', errors='ignore')
    else:
        return msg.get_payload(decode=True).decode('utf-8', errors='ignore')
    return "No text body available"

def main():
    print("Connecting to Gmail via IMAP...")
    mail = imaplib.IMAP4_SSL('imap.gmail.com')
    mail.login(MY_EMAIL, GMAIL_APP_PASSWORD)
    
    # 1. Select the All Mail folder so we can search globally
    mail.select('"[Gmail]/All Mail"')
    
    print("Searching for recent inbox emails...")
    # Search for emails in the inbox from the last 2 days
    status, response = mail.search(None, 'X-GM-RAW', '"in:inbox newer_than:2d"')
    message_nums = response[0].split()
    
    if not message_nums:
        print("No recent messages found.")
        mail.logout()
        return

    processed_threads = set()

    for num in message_nums:
        # Fetch the thread ID and basic headers
        status, data = mail.fetch(num, '(X-GM-THRID RFC822.HEADER)')
        
        thread_id = None
        for item in data:
            if isinstance(item, tuple):
                # Extract thread ID
                match = re.search(rb'X-GM-THRID (\d+)', item[0])
                if match:
                    thread_id = match.group(1).decode()
                    break
                    
        if not thread_id or thread_id in processed_threads:
            continue
            
        processed_threads.add(thread_id)
        
        # Now, fetch all messages in this thread from All Mail to find the latest one
        status, thread_resp = mail.search(None, 'X-GM-THRID', thread_id)
        thread_nums = thread_resp[0].split()
        
        if not thread_nums:
            continue
            
        # The last number in the thread is the latest message
        latest_num = thread_nums[-1]
        status, latest_data = mail.fetch(latest_num, '(RFC822)')
        
        latest_msg = None
        for item in latest_data:
            if isinstance(item, tuple):
                latest_msg = email.message_from_bytes(item[1])
                break
                
        if not latest_msg:
            continue
            
        sender = latest_msg.get('From', '')
        
        # If the latest message in the thread is from US, it means we already replied!
        if MY_EMAIL.lower() in sender.lower():
            continue
            
        # 2. Check if a draft already exists for this thread
        mail.select('"[Gmail]/Drafts"')
        status, draft_resp = mail.search(None, 'X-GM-THRID', thread_id)
        mail.select('"[Gmail]/All Mail"') # Switch back
        
        if draft_resp[0].split():
            continue # We already have a draft for this thread!

        # 3. We need to evaluate this email!
        subject = latest_msg.get('Subject', 'No Subject')
        body = get_email_body(latest_msg)
        message_id = latest_msg.get('Message-ID', '')
        
        print(f"\nEvaluating email from: {sender}")
        
        ai_prompt = f"{AI_INSTRUCTIONS}\n\nEMAIL SUBJECT: {subject}\nEMAIL BODY:\n{body}"
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=ai_prompt,
                config={"tools": [{"google_search": {}}]}
            )
            ai_reply = response.text.strip()
            
            if ai_reply == "IGNORE" or "IGNORE" in ai_reply[:10]:
                print("-> AI decided to IGNORE this email.")
            else:
                print("-> AI generated a draft! Uploading to Gmail...")
                
                # Extract email address
                email_match = re.search(r'<([^>]+)>', sender)
                to_address = email_match.group(1) if email_match else sender
                
                draft_msg = EmailMessage()
                draft_msg.set_content(ai_reply)
                draft_msg['To'] = to_address
                draft_msg['From'] = MY_EMAIL
                
                if not subject.lower().startswith("re:"):
                    subject = "Re: " + subject
                draft_msg['Subject'] = subject
                
                if message_id:
                    draft_msg['In-Reply-To'] = message_id
                    draft_msg['References'] = message_id

                # Append to Drafts folder
                mail.select('"[Gmail]/Drafts"')
                # We can't directly set X-GM-THRID via append, but adding In-Reply-To forces Gmail to group it!
                mail.append('"[Gmail]/Drafts"', '\\Draft', imaplib.Time2Internaldate(time.time()), draft_msg.as_bytes())
                mail.select('"[Gmail]/All Mail"') # Switch back
                
                print("-> Draft created successfully!")
                
        except Exception as e:
            print(f"Error calling AI: {e}")

    mail.logout()

if __name__ == '__main__':
    main()
