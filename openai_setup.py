import os
from openai import OpenAI

# Create OpenAI client and set API key from environment variable
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", "your-api-key-here")
)

# Use OpenAI API to generate code (using new API version)
response = client.chat.completions.create(
    model="gpt-3.5-turbo",  # Latest language model
    messages=[
        {"role": "system", "content": "You are a helpful assistant that provides clean, working Python code examples."},
        {"role": "user", "content": "Please write a Python implementation of the quicksort algorithm with brief comments explaining the code."}
    ],
    max_tokens=150,
    temperature=0
)

print("Generated quicksort algorithm:")
print(response.choices[0].message.content)
