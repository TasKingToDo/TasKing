import os
import google.generativeai as genai
DEBUG = False

# Configure API key
# transport='rest' to disable big scary warning at the end of prompts. still functional if removed also, import os not necessary if removed
genai.configure(api_key="API_Key_Here", transport='rest')  

# Set up the model
model = genai.GenerativeModel('gemini-pro') #or 'gemini-pro-vision' for multimodal.

def get_gemini_response(prompt):
    """Sends a prompt to Gemini and returns the response."""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"An error occurred: {e}"

def main():
    """Gets user input and sends it to Gemini."""
    while True:
        user_input = input("Ask a question (or type 'exit'): ")
        if user_input.lower() == "exit":
            break

        if not user_input: #Handles if the user just presses enter.
          continue

        response = get_gemini_response(user_input)
        print(response)
        if DEBUG: 
            print(type(response))

if __name__ == "__main__":
    main()
    
    
    


