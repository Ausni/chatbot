from flask import Flask, request, jsonify
from flask_cors import CORS  # Pour autoriser les requêtes depuis le frontend
from langchain_openai import AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import time
from google import genai
from langchain_google_genai import ChatGoogleGenerativeAI



app = Flask(__name__)
CORS(app)  # Active le CORS pour tout


def generer_la_reponse(message:str):
    # The client gets the API key from the environment variable `GEMINI_API_KEY`.
    client = genai.Client(api_key="votre_cles_api")

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=message
    )
    print(response.text)
    return response.text


@app.route('/api/endpoint/ai/gemini', methods=['POST'])
def traiter_la_requette():
    data = request.get_json()
    if not data or 'valeur' not in data:
        return jsonify({'error': 'Aucune valeur reçue'}), 400

    reponse=generer_la_reponse(data["valeur"])

    print(f"Entier reçu : {data}")
    return jsonify({'message': 'Entier bien reçu', 'valeur': reponse}), 200     
   

if __name__ == '__main__':
    #app.run(host='0.0.0.0',debug=True)
    app.run(debug=True)
