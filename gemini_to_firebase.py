import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

DEBUG = False

# Firebase setup (Firestore)
cred = credentials.Certificate("PATH TO CREDENTIAL JSON")
firebase_admin.initialize_app(cred) #No database url needed for firestore.
db = firestore.client()

# Gemini setup
# transport rest to get rid of big scary error
genai.configure(api_key="API_KEY_HERE", transport='rest') 
model = genai.GenerativeModel('gemini-pro')

def get_gemini_response(prompt):
    """Sends a prompt to Gemini and returns the response."""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred: {e}"

def push_to_firestore(user_input, ai_response):
    """Pushes user input and AI response to Firestore."""
    doc_ref = db.collection('chat_logs').document() # creates doc with random ID 
    doc_ref.set({
        'user_input': user_input,
        'ai_response': ai_response
    })
    if DEBUG:
        print(f"Data pushed to Firestore: {doc_ref.id}")

def main():
    """Gets user input, sends it to Gemini, and pushes to Firestore."""
    while True:
        user_input = input("Ask a question (or type 'exit'): ")
        if user_input.lower() == "exit":
            break
        if not user_input:
            continue

        ai_response = get_gemini_response(user_input)
        print(ai_response)
        push_to_firestore(user_input, ai_response)

if __name__ == "__main__":
    main()